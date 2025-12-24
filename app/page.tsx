import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">System Status: Online 🟢</h1>
      <p className="mt-4">If you see this, the deployment is working.</p>
      <a href="/login" className="mt-8 text-blue-500 hover:underline">Go to Login</a>
    </div>
  )
}
