import { supabase } from './supabaseClient'

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  onAuthStateChange(callback) {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return subscription
  },

  async signInWithOtp(email) {
    const { error } = await supabase.auth.signInWithOtp({ email })
    return { error }
  },

  async signOut() {
    await supabase.auth.signOut()
  },
}
