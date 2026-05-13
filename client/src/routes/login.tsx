import { createFileRoute } from '@tanstack/react-router'
import { LogIn, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: Login,
});

function generateCodes() {
  return crypto.randomUUID();
};

function Login() {

  const handleLogin = () => {
    const nonce = generateCodes();
    const state = generateCodes();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);

    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

    const authUrl = `${import.meta.env.VITE_OAUTH_PROVIDER_URL}/o/authenticate?response_type=code&scope=openid&client_id=${clientId}&redirect_url=${redirectUrl}&state=${state}&nonce=${nonce}`;

    window.location.href = authUrl;
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 font-sans"
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo / Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300"
          style={{ backgroundColor: '#F2923B' }}
        >
          <BarChart3 className="w-8 h-8 text-white" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Chai Poll</h1>
          <p className="text-base">
            Log in to cast your vote and create polls.
          </p>
        </div>

        {/* OAuth Button */}
        <div className="w-full">
          <button
            className="w-full cursor-pointer flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold shadow-[0_0_20px_rgba(242,146,59,0.2)] transition-all duration-200 hover:shadow-[0_0_25px_rgba(242,146,59,0.4)] hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: '#F2923B', color: 'white' }}
            onClick={handleLogin}
          >
            <LogIn className="w-5 h-5" />
            Login with OAuth
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-12">
          By continuing, you agree to our <br />
          <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </main>
  )
}
