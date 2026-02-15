import { supabase } from './supabaseClient'

/**
 * Get shift for a worksite and date (single row by unique constraint).
 * @param {string} worksiteId
 * @param {string} workDate - YYYY-MM-DD
 * @returns {{ data: object | null, error: object | null }}
 */
export async function getByWorksiteAndDate(worksiteId, workDate) {
  if (!worksiteId || !workDate) return { data: null, error: null }
  const { data, error } = await supabase
    .from('work_shifts')
    .select('*')
    .eq('worksite_id', worksiteId)
    .eq('work_date', workDate)
    .maybeSingle()
  return { data, error }
}

/**
 * Upsert a shift (insert or update on conflict owner_id, worksite_id, work_date).
 * @param {{ worksiteId: string, workDate: string, requiredWorkers: number, clientRate: number, workerPay: number, ownerId: string }}
 * @returns {{ data: object | null, error: object | null }}
 */
export async function upsertShift({ worksiteId, workDate, requiredWorkers, clientRate, workerPay, ownerId }) {
  if (!ownerId || !worksiteId || !workDate) {
    return { data: null, error: new Error('ownerId, worksiteId and workDate are required') }
  }
  const payload = {
    owner_id: ownerId,
    worksite_id: worksiteId,
    work_date: workDate,
    required_workers: Number(requiredWorkers) || 0,
    client_rate: Number(clientRate) || 0,
    worker_pay: Number(workerPay) || 0,
  }
  const { data, error } = await supabase
    .from('work_shifts')
    .upsert(payload, {
      onConflict: 'owner_id,worksite_id,work_date',
    })
    .select()
    .single()
  return { data, error }
}

export const shiftsService = {
  getByWorksiteAndDate,
  upsertShift,
}
