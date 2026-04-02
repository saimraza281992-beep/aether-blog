import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export function Auth() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email);
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-border/20 p-12 rounded-3xl border border-border backdrop-blur-sm"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif mb-4">Welcome to Aether</h1>
          <p className="text-muted font-light">Enter your email to receive a magic link for secure sign-in.</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-serif mb-2">Check your inbox</h2>
            <p className="text-muted font-light">We've sent a magic link to <span className="text-foreground font-medium">{email}</span>.</p>
            <button 
              onClick={() => setSent(false)}
              className="mt-8 text-sm text-muted hover:text-foreground transition-colors underline underline-offset-4"
            >
              Try another email
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-light">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center space-x-2 group"
            >
              <span>{loading ? 'Sending...' : 'Send Magic Link'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <p className="text-xs text-muted text-center font-light mt-8">
              By continuing, you agree to Aether's <br />
              <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
