import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { LogOut, User as UserIcon, Flame, Minimize2, LogIn } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '#/auth/use-auth'
import apiClient from '#/services/apiClient.service'
import { useDispatch } from 'react-redux'
import { logout } from '#/slice/authSlice'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  const navigate = useNavigate()
  const { setUser, setAccessToken, user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial check
    if (window.scrollY <= 20) {
      setIsCollapsed(false);
      setIsScrolled(false);
    } else {
      setIsCollapsed(true);
      setIsScrolled(true);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Auto collapse when scrolling down
      if (currentScrollY > 20) {
        setIsCollapsed(true);
      }

      // Auto expand when fully at top
      if (currentScrollY <= 20) {
        setIsCollapsed(false);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await apiClient.logout();

      setUser(null);
      setAccessToken(null);
      dispatch(logout());

      navigate({ to: '/' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex transition-all duration-500 ease-in-out ${isCollapsed ? 'justify-end pt-4 px-4 sm:px-8' : 'justify-center pt-8 px-6'}`}>
      <div
        className={`flex items-center relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCollapsed
          ? 'justify-between w-14 h-14 bg-(--surface) border border-(--line) backdrop-blur-md shadow-lg rounded-full cursor-pointer hover:scale-105 group px-0 py-0'
          : `justify-between w-full max-w-5xl ${isScrolled
            ? 'bg-(--header-bg) border border-(--line) shadow-[0_8px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl rounded-full px-6 py-3 h-[72px]'
            : 'bg-(--surface) border border-(--line) backdrop-blur-md shadow-lg rounded-full px-8 py-4 h-[88px]'
          }`
          }`}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        {/* Left: Logo & Title */}
        <div className={`flex items-center shrink-0 transition-all duration-500 ${isCollapsed ? 'w-14 h-14 justify-center' : ''}`}>
          <Link
            to="/"
            onClick={(e) => { if (isCollapsed) e.preventDefault(); }}
            className={`flex items-center justify-center shrink-0 transition-all duration-500 ${isCollapsed
              ? 'w-14 h-14'
              : 'w-10 h-10 rounded-full bg-(--surface-strong) border border-(--line) hover:scale-110 group-hover:scale-110'
              }`}
          >
            <Flame className={`transition-all duration-500 text-(--lagoon) ${isCollapsed ? 'w-6 h-6 animate-pulse group-hover:scale-110' : 'w-5 h-5'}`} />
          </Link>
          <div className={`flex items-center overflow-hidden transition-all duration-500 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
            <span className="font-bold text-xl text-(--sea-ink) tracking-tight hidden sm:block whitespace-nowrap">Chai Poll</span>
          </div>
        </div>

        {/* Center: Links (Absolute Centered) */}
        <nav className={`absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 whitespace-nowrap transition-all duration-500 pointer-events-none ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Link to="/" className="text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors pointer-events-auto" activeProps={{ className: 'text-(--sea-ink)' }}>
            Home
          </Link>
          {user && (
            <>
              <Link to="/poll" className="text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors pointer-events-auto" activeProps={{ className: 'text-(--sea-ink)' }}>
                Create Poll
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors pointer-events-auto" activeProps={{ className: 'text-(--sea-ink)' }}>
                Dashboard
              </Link></>
          )}
        </nav>

        {/* Right: Actions */}
        <div className={`flex items-center whitespace-nowrap shrink-0 overflow-hidden transition-all duration-500 ${isCollapsed ? 'opacity-0 max-w-0 gap-0' : 'opacity-100 max-w-[500px] gap-4'}`}>
          <ThemeToggle />

          <div className="w-px h-6 bg-(--line) mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate({ to: "/profile" })} className="w-10 h-10 rounded-full bg-(--surface-strong) border border-(--line) flex items-center justify-center text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--surface) transition-all cursor-pointer">
                <UserIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              search={{ redirect: "/" }}
              className="group flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(242,146,59,0.3)] hover:shadow-[0_0_30px_rgba(242,146,59,0.5)]"
              style={{ backgroundColor: '#F2923B', color: 'white' }}
            >
              Sign In
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {/* Collapse Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
            className="ml-2 w-8 h-8 rounded-full bg-(--surface-strong) border border-(--line) flex items-center justify-center hover:bg-(--surface) text-(--sea-ink-soft) hover:text-(--sea-ink) transition-all cursor-pointer hidden md:flex"
            title="Collapse Header"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
