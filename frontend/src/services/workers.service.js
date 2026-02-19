import { supabase } from './supabaseClient'

export const workersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(worker) {
    const { data, error } = await supabase
      .from('workers')
      .insert({
        first_name: worker.firstName.trim(),
        last_name: worker.lastName.trim(),
        phone: worker.phone?.trim() || null,
        email: worker.email?.trim() || null,
        note: worker.note?.trim() || null,
      })
      .select('id')
      .limit(1)
    return { data, error }
  },

  async update(workerId, updates) {
    const payload = {}
    if (updates.firstName !== undefined) payload.first_name = updates.firstName.trim()
    if (updates.lastName !== undefined) payload.last_name = updates.lastName.trim()
    if (updates.phone !== undefined) payload.phone = updates.phone?.trim() || null
    if (updates.email !== undefined) payload.email = updates.email?.trim() || null
    if (updates.note !== undefined) payload.note = updates.note?.trim() || null
    if (Object.keys(payload).length === 0) return { data: null, error: null }
    const { data, error } = await supabase
      .from('workers')
      .update(payload)
      .eq('id', workerId)
      .select('id')
      .limit(1)
    return { data, error }
  },

  createWorker(payload) {
    return this.create(payload)
  },

  updateWorker(id, payload) {
    return this.update(id, payload)
  },
}
