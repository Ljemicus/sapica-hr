'use server';

import { revalidatePath } from 'next/cache';

export async function refreshFounderDashboard() {
  revalidatePath('/admin/founder-dashboard');
}
