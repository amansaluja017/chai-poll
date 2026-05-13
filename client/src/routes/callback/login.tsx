import apiClient from '#/services/apiClient.service';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '#/auth/use-auth';

export const Route = createFileRoute('/callback/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();
  const { setUser, updateTokens } = useAuth();

  const { state, code } = useSearch({ from: '/callback/login' }) as { state: string, code: string };

  useEffect(() => {
    async function handleResponse() {
      const localState = sessionStorage.getItem('oauth_state');

      if (!localState) {
        setError(new Error("OAuth state not found in session"));
        return;
      }

      if (localState !== state) {
        setError(new Error("OAuth state does not match"));
        return;
      }

      try {
        const { user, accessToken } = await apiClient.authenticate({
          code,
          redirect_url: import.meta.env.VITE_REDIRECT_URL,
          nonce: sessionStorage.getItem('oauth_nonce')!
        });

        sessionStorage.removeItem('oauth_nonce');
        sessionStorage.removeItem('oauth_state');
        setUser(user);
        updateTokens(accessToken);
        navigate({ to: '/poll' });

      } catch (err) {
        console.log(err);
        if (err instanceof AxiosError) {
          const message = err.response?.data?.message || err.message;
          setError(new Error(message));
        } else if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("An unexpected error occurred"));
        }
      }

    };

    handleResponse();
  }, [code, state, navigate]);

  if (error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6 font-sans"
        style={{ backgroundColor: '#111111', color: 'white' }}
      >
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Authentication Failed</h1>
            <p className="text-white/60">{error.message}</p>
          </div>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="mt-4 px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#F2923B', color: 'white' }}
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 font-sans"
      style={{ backgroundColor: '#111111', color: 'white' }}
    >
      <div className="flex flex-col items-center space-y-6">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: '#F2923B' }}
        />
        <h1 className="text-xl font-medium tracking-tight animate-pulse text-white/80">
          Authenticating...
        </h1>
        <p className="text-white/40 text-sm">Please wait while we verify your credentials</p>
      </div>
    </main>
  );
}
