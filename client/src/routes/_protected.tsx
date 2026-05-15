// routes/_protected.tsx

import { useAuth } from '#/auth/use-auth';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-4 bg-(--lagoon)/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-(--lagoon) animate-spin relative z-10" />
          </div>
          <p className="text-(--sea-ink-soft) font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login", search: { redirect: location.href } })
  }

  return <Outlet />
}
