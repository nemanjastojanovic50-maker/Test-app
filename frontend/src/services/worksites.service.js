import { supabase } from './supabaseClient'

export const worksitesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('worksites')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(worksite) {
    const { error } = await supabase.from('worksites').insert({
      title: worksite.title.trim(),
      address_text: worksite.addressText.trim() || null,
      lat: worksite.lat,
      lng: worksite.lng,
    })
    return { error }
  },
}
