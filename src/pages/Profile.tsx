import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile, Post } from '../types';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { Settings, Edit, Heart, MessageCircle, Bookmark, UserPlus, UserMinus, Globe, Twitter, Github } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'bookmarks'>('published');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${username},id.eq.${username}`)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data as Profile);
        
        // Fetch posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('author_id', data.id)
          .eq('status', activeTab === 'drafts' ? 'draft' : 'published')
          .order('created_at', { ascending: false });
        
        setPosts(postsData as Post[]);

        // Check if following
        if (user && user.id !== data.id) {
          const { data: followData } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', data.id)
            .single();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username, user, activeTab]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', profile.id);
      setIsFollowing(false);
    } else {
      await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-2xl font-serif">Profile not found.</div>;

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
        <div className="md:col-span-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-3xl overflow-hidden border border-border bg-border/20 mb-8"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <span className="text-6xl font-serif">{profile.full_name?.[0] || profile.username?.[0]}</span>
              </div>
            )}
          </motion.div>
          
          <div className="flex space-x-4">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">
                <Globe size={20} />
              </a>
            )}
            <a href="#" className="text-muted hover:text-foreground transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-muted hover:text-foreground transition-colors"><Github size={20} /></a>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-8xl font-serif tracking-tighter"
            >
              {profile.full_name || profile.username}
            </motion.h1>
            
            <div className="flex items-center space-x-4">
              {isOwnProfile ? (
                <>
                  <Link to="/settings" className="btn-secondary flex items-center space-x-2">
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link to="/new" className="btn-primary flex items-center space-x-2">
                    <Edit size={18} />
                    <span>New Story</span>
                  </Link>
                </>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={cn("btn-primary flex items-center space-x-2", isFollowing && "bg-border text-foreground hover:bg-border/80")}
                >
                  {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              )}
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted font-light max-w-2xl leading-relaxed"
          >
            {profile.bio || "No bio yet. This storyteller is keeping their secrets."}
          </motion.p>
        </div>
      </header>

      <section>
        <div className="flex items-center space-x-12 border-b border-border mb-12">
          <button 
            onClick={() => setActiveTab('published')}
            className={cn("pb-4 text-sm uppercase tracking-widest font-medium transition-all relative", activeTab === 'published' ? "text-foreground" : "text-muted hover:text-foreground")}
          >
            Published
            {activeTab === 'published' && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-accent" />}
          </button>
          {isOwnProfile && (
            <button 
              onClick={() => setActiveTab('drafts')}
              className={cn("pb-4 text-sm uppercase tracking-widest font-medium transition-all relative", activeTab === 'drafts' ? "text-foreground" : "text-muted hover:text-foreground")}
            >
              Drafts
              {activeTab === 'drafts' && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-accent" />}
            </button>
          )}
          <button 
            onClick={() => setActiveTab('bookmarks')}
            className={cn("pb-4 text-sm uppercase tracking-widest font-medium transition-all relative", activeTab === 'bookmarks' ? "text-foreground" : "text-muted hover:text-foreground")}
          >
            Bookmarks
            {activeTab === 'bookmarks' && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-accent" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col"
              >
                <Link to={post.status === 'draft' ? `/edit/${post.id}` : `/post/${post.slug}`} className="block aspect-[16/9] overflow-hidden rounded-2xl mb-6 bg-border/20">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted italic font-serif">No cover</div>
                  )}
                </Link>
                <div className="flex flex-col flex-grow">
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">{formatDate(post.created_at)}</div>
                  <Link to={post.status === 'draft' ? `/edit/${post.id}` : `/post/${post.slug}`} className="group-hover:opacity-80 transition-opacity">
                    <h3 className="text-2xl font-serif leading-tight mb-4">{post.title}</h3>
                    <p className="text-muted text-sm line-clamp-2 mb-6 font-light">{post.excerpt}</p>
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-4 text-muted">
                      <div className="flex items-center space-x-1 text-xs">
                        <Heart size={14} />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <MessageCircle size={14} />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                    {isOwnProfile && post.status === 'draft' && (
                      <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">Draft</span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted font-serif text-xl italic">No stories found here yet.</p>
              {isOwnProfile && <Link to="/new" className="btn-primary mt-6 inline-block">Start Writing</Link>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
