import { supabase } from '../supabase';
import { WalkSession } from '../../types';

export async function getWalkSession(): Promise<WalkSession | null> {
  const { data, error } = await supabase
    .from('walks')
    .select('*, sitter:users!sitter_id(name, avatar_url), pet:pets!pet_id(name)')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const startTime = new Date(data.start_time);
  const endTime = data.end_time ? new Date(data.end_time) : new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMin = Math.round(durationMs / 60000);
  const distKm = Number(data.distance_km) || 0;
  const avgSpeed = durationMin > 0 ? ((distKm / durationMin) * 60).toFixed(1) : '0';

  return {
    id: data.id,
    sitterName: data.sitter?.name || 'Sitter',
    sitterAvatar: data.sitter?.avatar_url || '',
    petName: data.pet?.name || 'Ljubimac',
    status: data.status === 'zavrsena' ? 'zavrseno' : 'u_tijeku',
    startTime: startTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }),
    endTime: data.end_time ? endTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }) : undefined,
    duration: `${durationMin} min`,
    distance: `${distKm.toFixed(1)} km`,
    avgSpeed: `${avgSpeed} km/h`,
    checkpoints: (data.checkpoints || []).map((cp: any, i: number) => ({
      id: String(i + 1),
      time: cp.time || '',
      label: cp.label || '',
      lat: cp.lat || 0,
      lng: cp.lng || 0,
    })),
    route: (data.route || []).map((point: any) => ({
      lat: point.lat || 0,
      lng: point.lng || 0,
    })),
  };
}
