import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';

export interface DeviceInfo {
  userAgent: string;
  ip: string | null;
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  lastActive: string;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: string;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

/**
 * Extract device information from request headers
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const ip = headersList.get('x-forwarded-for') || 
             headersList.get('x-real-ip') || 
             null;

  // Parse user agent
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  // Determine device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  if (device.type === 'mobile') {
    deviceType = 'mobile';
  } else if (device.type === 'tablet') {
    deviceType = 'tablet';
  } else if (!device.type) {
    deviceType = 'desktop';
  }

  // Generate device name
  const deviceName = device.vendor && device.model 
    ? `${device.vendor} ${device.model}`
    : `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`;

  // Generate unique device ID (hash of user agent + IP)
  const deviceId = await generateDeviceId(userAgent, ip);

  return {
    userAgent,
    ip,
    deviceId,
    deviceName,
    browser: browser.name || 'Unknown',
    os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
    deviceType,
    lastActive: new Date().toISOString(),
  };
}

/**
 * Generate a unique device ID from user agent and IP
 */
async function generateDeviceId(userAgent: string, ip: string | null): Promise<string> {
  const data = `${userAgent}:${ip || 'unknown'}`;
  
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/**
 * Save device session to database
 */
export async function saveDeviceSession(
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        device_id: deviceInfo.deviceId,
        device_name: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device_type: deviceInfo.deviceType,
        ip_address: deviceInfo.ip,
        user_agent: deviceInfo.userAgent,
        last_active: deviceInfo.lastActive,
      }, {
        onConflict: 'user_id,device_id',
      });

    if (error) {
      appLogger.error('auth', 'Failed to save device session', { error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('auth', 'Exception saving device session', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Get all active devices for a user
 */
export async function getUserDevices(userId: string): Promise<DeviceSession[]> {
  try {
    const supabase = await createClient();
    
    // Get current device ID
    const currentDeviceInfo = await getDeviceInfo();
    
    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false });

    if (error) {
      appLogger.error('auth', 'Failed to get user devices', { error: error.message });
      return [];
    }

    return (data || []).map((device: Record<string, unknown>) => ({
      id: device.id as string,
      userId: device.user_id as string,
      deviceId: device.device_id as string,
      deviceName: device.device_name as string,
      browser: device.browser as string,
      os: device.os as string,
      deviceType: device.device_type as string,
      ipAddress: device.ip_address as string | null,
      userAgent: device.user_agent as string,
      createdAt: device.created_at as string,
      lastActive: device.last_active as string,
      isCurrent: device.device_id === currentDeviceInfo.deviceId,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('auth', 'Exception getting user devices', { error: message });
    return [];
  }
}

/**
 * Remove a specific device session
 */
export async function removeDeviceSession(
  userId: string,
  deviceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    if (error) {
      appLogger.error('auth', 'Failed to remove device session', { error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('auth', 'Exception removing device session', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Remove all other device sessions (logout from all other devices)
 */
export async function removeAllOtherDevices(
  userId: string,
  currentDeviceId: string
): Promise<{ success: boolean; removedCount: number; error?: string }> {
  try {
    const supabase = await createClient();
    
    // First count how many will be removed
    const { count, error: countError } = await supabase
      .from('user_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('device_id', currentDeviceId);

    if (countError) {
      appLogger.error('auth', 'Failed to count other devices', { error: countError.message });
      return { success: false, removedCount: 0, error: countError.message };
    }

    // Delete all other devices
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .eq('user_id', userId)
      .neq('device_id', currentDeviceId);

    if (error) {
      appLogger.error('auth', 'Failed to remove other devices', { error: error.message });
      return { success: false, removedCount: 0, error: error.message };
    }

    appLogger.info('auth', 'Removed all other device sessions', { 
      userId, 
      removedCount: count || 0 
    });

    return { success: true, removedCount: count || 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('auth', 'Exception removing other devices', { error: message });
    return { success: false, removedCount: 0, error: message };
  }
}

/**
 * Clean up old device sessions (older than X days)
 */
export async function cleanupOldDevices(
  daysOld: number = 90
): Promise<{ success: boolean; removedCount: number; error?: string }> {
  try {
    const supabase = await createClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // First count how many will be removed
    const { count, error: countError } = await supabase
      .from('user_devices')
      .select('*', { count: 'exact', head: true })
      .lt('last_active', cutoffDate.toISOString());

    if (countError) {
      appLogger.error('auth', 'Failed to count old devices', { error: countError.message });
      return { success: false, removedCount: 0, error: countError.message };
    }

    // Delete old devices
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .lt('last_active', cutoffDate.toISOString());

    if (error) {
      appLogger.error('auth', 'Failed to cleanup old devices', { error: error.message });
      return { success: false, removedCount: 0, error: error.message };
    }

    appLogger.info('auth', 'Cleaned up old device sessions', { 
      daysOld, 
      removedCount: count || 0 
    });

    return { success: true, removedCount: count || 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('auth', 'Exception cleaning up old devices', { error: message });
    return { success: false, removedCount: 0, error: message };
  }
}
