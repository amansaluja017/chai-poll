// routes/_protected.tsx

import { useAuth } from '#/auth/use-auth';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();


  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    navigate({ to: "/login", search: { redirect: location.href } })
  }

  return <Outlet />
}
