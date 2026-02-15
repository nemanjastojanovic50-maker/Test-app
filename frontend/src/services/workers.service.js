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
        phone: worker.phone.trim() || null,
        note: worker.note.trim() || null,
      })
      .select('id')
      .limit(1)
    return { data, error }
  },
}
