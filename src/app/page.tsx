import { AuthForm } from '@/components/auth-form'
import { OrderForm } from '@/components/order-form'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-zinc-100">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-br from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Cartagena Concierge
          </h1>
          <p className="text-zinc-400 text-lg">
            Secure, discreet, and instant cash delivery to your doorstep. The premium experience you deserve.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Available in Cartagena</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* In a real app we'd check session here. If logged in, show OrderForm, else AuthForm */}
          {/* For now, we show AuthForm as entry. Logic can be added later. */}
          <AuthForm />
        </div>
      </div>

      {/* Temporary Link for Driver App Access (since we don't have role based routing in demo yet) */}
      <footer className="absolute bottom-4 text-zinc-800 text-xs">
        <a href="/driver">Driver Access</a>
      </footer>
    </main>
  )
}
