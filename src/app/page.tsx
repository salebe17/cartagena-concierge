import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrderForm } from '@/components/order-form'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, we should actually show the AuthForm or redirect. 
    // The user prompt asked to redirect to /login, but we don't have a specific /login page,
    // we usually had AuthForm on home. 
    // HOWEVER, the prompt explicitly said: "If NOT Logged In: Show the Order Form (or Redirect to Login...)"
    // "Overwrite src/app/page.tsx with this logic: ... if (!user) return redirect('/login')"
    // Since we don't have a separate /login page in the file structure I recall, 
    // I will assume the user WANTS to redirect and will maybe create a login page later, 
    // OR better yet, I should probably render the AuthForm if not logged in to avoid 404.
    // BUT strict adherence to "Overwrite ... with this logic" suggests I should follow the code block.
    // Wait, the prompt code block imports OrderForm.
    // Let's look at the previous file. It had AuthForm.
    // If I redirect to /login it might break if /login doesn't exist.
    // Let's check if /login exists? No tool for that right now.
    // I will stick to the prompts code block but maybe recover safely?
    // Actually, let's look at the "Previous Session Summary". 
    // "New Feature: Google OAuth ... added ... to `src/components/auth-form.tsx`... displayed on Home".
    // If I replace Home with just OrderForm or Redirect, user can't login.
    // The prompt says "If NOT Logged In: Show the Order Form (or Redirect to Login)".
    // I will follow the prompt code "redirect('/login')" but I suspect /login is missing. 
    // Actually, looking at the user request: "If NOT Logged In: Show the Order Form (or Redirect to Login...)"
    // And the code: `if (!user) { return redirect('/login') }`
    // I will implement exactly as requested. If /login is missing, user will ask to fix it.
    return redirect('/login')
  }

  // Check for ACTIVE orders only
  const { data: activeOrder } = await supabase
    .from('orders')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'paid', 'in_transit']) // We ignore 'delivered'
    .single()

  if (activeOrder) {
    // If they have an active order, send them to track it
    redirect('/dashboard')
  }

  // If no active order (or just finished one), show the form to buy again
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-black text-white text-center">
          <h1 className="text-xl font-bold">Cartagena Concierge</h1>
          <p className="text-sm opacity-80">Nuevo Servicio</p>
        </div>
        <div className="p-6">
          <OrderForm />
        </div>
      </div>
    </div>
  )
}
