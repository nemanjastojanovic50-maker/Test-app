import { supabase } from './supabaseClient'

export const assignmentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('assignments')
      .select('id, worksite_id, worker:workers(id, first_name, last_name, email)')
      .order('assigned_at', { ascending: false })
    return { data, error }
  },

  async create(assignment) {
    const { error } = await supabase.from('assignments').insert({
      worker_id: assignment.workerId,
      worksite_id: assignment.worksiteId,
    })
    return { error }
  },

  async update(assignmentId, worksiteId) {
    const { error } = await supabase
      .from('assignments')
      .update({ worksite_id: worksiteId })
      .eq('id', assignmentId)
    return { error }
  },

  async getByWorkerId(workerId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('id')
      .eq('worker_id', workerId)
      .maybeSingle()
    return { data, error }
  },

  async assign(workerId, worksiteId) {
    const { data: existing, error: fetchErr } = await this.getByWorkerId(workerId)
    if (fetchErr) return { error: fetchErr }
    if (existing?.id) {
      return this.update(existing.id, worksiteId)
    }
    return this.create({ workerId, worksiteId })
  },

  async unassign(workerId) {
    const { data: existing, error: fetchErr } = await this.getByWorkerId(workerId)
    if (fetchErr) return { error: fetchErr }
    if (existing?.id) {
      return this.update(existing.id, null)
    }
    return { error: null }
  },
}
