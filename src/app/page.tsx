import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  } else {
    redirect('/dashboard')
  }
}
