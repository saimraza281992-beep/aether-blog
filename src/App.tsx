import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { PostDetail } from './pages/PostDetail';
import { Editor } from './pages/Editor';
import { ProfilePage } from './pages/Profile';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();
  
  // DEBUG GUARD: If the app is blank, check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-12 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-serif mb-6">Configuration Required</h1>
          <p className="text-muted mb-8">It looks like your Supabase environment variables are missing. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your Netlify environment settings.</p>
          <div className="bg-border/20 p-4 rounded-xl text-left font-mono text-xs overflow-auto">
            URL: {supabaseUrl || 'MISSING'}<br />
            KEY: {supabaseKey ? 'PRESENT' : 'MISSING'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          
          <Route path="/new" element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } />
          <Route path="/edit/:id" element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
