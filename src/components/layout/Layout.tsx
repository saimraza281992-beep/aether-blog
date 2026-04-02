import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Edit, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass-nav px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-3xl font-serif tracking-tighter hover:opacity-80 transition-opacity">
            Aether
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-muted hover:text-foreground transition-colors">
              <Search size={20} />
            </Link>
            
            {user ? (
              <>
                <Link to="/new" className="flex items-center space-x-2 text-muted hover:text-foreground transition-colors">
                  <Edit size={20} />
                  <span>Write</span>
                </Link>
                <Link to={`/profile/${profile?.username || user.id}`} className="flex items-center space-x-2 text-muted hover:text-foreground transition-colors">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-8 h-8 rounded-full border border-border" />
                  ) : (
                    <User size={20} />
                  )}
                </Link>
                <button onClick={() => signOut()} className="text-muted hover:text-foreground transition-colors">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-background pt-24 px-6"
          >
            <div className="flex flex-col space-y-8 text-2xl font-serif">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/search" onClick={() => setIsMenuOpen(false)}>Search</Link>
              {user ? (
                <>
                  <Link to="/new" onClick={() => setIsMenuOpen(false)}>Write</Link>
                  <Link to={`/profile/${profile?.username || user.id}`} onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="text-left">Sign Out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-border py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-2xl font-serif">Aether</div>
          <div className="flex space-x-8 text-muted text-sm">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
          <div className="text-muted text-sm">
            © {new Date().getFullYear()} Aether. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
