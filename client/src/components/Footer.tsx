import { Flame } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-(--line) bg-(--surface) backdrop-blur-md px-6 py-12 md:py-16 text-(--sea-ink-soft) transition-all duration-300">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-8">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-(--surface-strong) border border-(--line) flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-[0_0_15px_rgba(45,180,203,0.3)]">
              <Flame className="w-5 h-5 text-(--lagoon) group-hover:animate-pulse" />
            </div>
            <span className="text-xl font-bold font-display text-(--sea-ink) tracking-tight group-hover:text-(--lagoon) transition-colors">
              Chai Poll
            </span>
          </Link>
          <p className="text-sm max-w-xs text-center md:text-left leading-relaxed">
            Create, share, and analyze dynamic polls in real-time. Experience the joy of community engagement.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 text-center sm:text-left">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-(--sea-ink) text-xs tracking-wider uppercase mb-2">Platform</h4>
            <Link to="/" className="text-sm hover:text-(--lagoon) hover:translate-x-1 transition-all">Home</Link>
            <Link to="/poll" className="text-sm hover:text-(--lagoon) hover:translate-x-1 transition-all">Create Poll</Link>
            <Link to="/dashboard" className="text-sm hover:text-(--lagoon) hover:translate-x-1 transition-all">Dashboard</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-(--sea-ink) text-xs tracking-wider uppercase mb-2">Connect</h4>
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <a href="https://github.com/amansaluja017" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-(--surface-strong) border border-(--line) hover:border-(--lagoon) hover:text-(--lagoon) hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/aman-saluja-a8791333b/" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-(--surface-strong) border border-(--line) hover:border-[#F2923B] hover:text-[#F2923B] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-(--line) flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p>&copy; {year} Chai Poll. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-(--lagoon) animate-pulse"></span>
          <span className="text-(--sea-ink) font-semibold">Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
