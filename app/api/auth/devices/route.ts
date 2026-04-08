import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getUserDevices, 
  removeDeviceSession, 
  removeAllOtherDevices,
  getDeviceInfo 
} from '@/lib/auth/device';
import { appLogger } from '@/lib/logger';

/**
 * GET /api/auth/devices
 * List all active devices for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Morate biti prijavljeni' },
        { status: 401 }
      );
    }

    const devices = await getUserDevices(user.id);

    return NextResponse.json({
      devices,
      count: devices.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('api', 'Error fetching devices', { error: message });
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Greška pri dohvaćanju uređaja' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/devices
 * Remove a specific device or all other devices
 * Body: { deviceId: string } or { allOthers: true }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Morate biti prijavljeni' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const currentDeviceInfo = await getDeviceInfo();

    // Remove all other devices
    if (body.allOthers === true) {
      const result = await removeAllOtherDevices(user.id, currentDeviceInfo.deviceId);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to remove devices', message: result.error },
          { status: 500 }
        );
      }

      appLogger.info('api', 'Removed all other device sessions', {
        userId: user.id,
        removedCount: result.removedCount,
      });

      return NextResponse.json({
        success: true,
        message: `Odjavljeni ste s ${result.removedCount} drugih uređaja`,
        removedCount: result.removedCount,
      });
    }

    // Remove specific device
    if (!body.deviceId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Nedostaje deviceId' },
        { status: 400 }
      );
    }

    // Prevent removing current device via this endpoint
    if (body.deviceId === currentDeviceInfo.deviceId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Ne možete obrisati trenutni uređaj. Koristite odjavu.' },
        { status: 400 }
      );
    }

    const result = await removeDeviceSession(user.id, body.deviceId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to remove device', message: result.error },
        { status: 500 }
      );
    }

    appLogger.info('api', 'Removed device session', {
      userId: user.id,
      deviceId: body.deviceId,
    });

    return NextResponse.json({
      success: true,
      message: 'Uređaj je uspješno uklonjen',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appLogger.error('api', 'Error removing device', { error: message });
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Greška pri uklanjanju uređaja' },
      { status: 500 }
    );
  }
}
