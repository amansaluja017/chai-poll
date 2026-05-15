import { createFileRoute } from '@tanstack/react-router'
import { User, Mail } from 'lucide-react'
import { useAuth } from '#/auth/use-auth';

export const Route = createFileRoute('/_protected/profile')({
  component: RouteComponent,
});

function RouteComponent() {

  const { user } = useAuth();

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans flex flex-col items-center" style={{ paddingTop: '150px' }}>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-(--sea-ink)">Your Profile</h1>
          <p className="text-lg text-(--sea-ink-soft)">Manage your account details.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-(--surface) border border-(--line) rounded-3xl p-8 shadow-xl backdrop-blur-sm transition-all relative overflow-hidden group hover:border-(--lagoon)">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2923B] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="relative flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-(--surface-strong) border-4 border-(--surface) shadow-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
              <User className="w-10 h-10 text-(--lagoon)" />
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-(--sea-ink) mb-3">{user?.name || "Anonymous User"}</h2>
            <div className="flex items-center gap-2 text-(--sea-ink-soft) mb-8 bg-(--surface-strong) px-4 py-2 rounded-full border border-(--line) shadow-sm">
              <Mail className="w-4 h-4 text-[#F2923B]" />
              <span className="text-sm font-semibold">{user?.email || "No email available"}</span>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
