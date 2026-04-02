import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post, Comment } from '../types';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth';

export function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data as Post);
        
        // Check if liked
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .single();
          setIsLiked(!!likeData);

          // Check if following
          const { data: followData } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', data.author_id)
            .single();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('post_id', (await supabase.from('posts').select('id').eq('slug', slug).single()).data?.id)
        .order('created_at', { ascending: false });

      if (!error) setComments(data as Comment[]);
    };

    fetchPost();
    fetchComments();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      setIsLiked(false);
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      setIsLiked(true);
    }
  };

  const handleFollow = async () => {
    if (!user || !post) return;
    if (isFollowing) {
      await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', post.author_id);
      setIsFollowing(false);
    } else {
      await supabase.from('followers').insert({ follower_id: user.id, following_id: post.author_id });
      setIsFollowing(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !commentText.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: commentText.trim()
      })
      .select(`*, user:profiles(*)`)
      .single();

    if (!error) {
      setComments([data as Comment, ...comments]);
      setCommentText('');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-2xl font-serif">Post not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Immersive Header */}
      <header className="relative h-[80vh] w-full mb-24 overflow-hidden">
        {post.cover_image && (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={post.cover_image} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-6 pb-12">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted hover:text-foreground transition-colors mb-12 uppercase tracking-widest text-sm">
            <ArrowLeft size={16} />
            <span>Back to Journal</span>
          </Link>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-serif leading-tight mb-8"
          >
            {post.title}
          </motion.h1>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-8"
          >
            <div className="flex items-center space-x-4">
              <img src={post.author?.avatar_url || ''} alt="" className="w-12 h-12 rounded-full border border-border" />
              <div>
                <Link to={`/profile/${post.author?.username || post.author_id}`} className="block font-medium hover:underline">
                  {post.author?.full_name || 'Anonymous'}
                </Link>
                <span className="text-sm text-muted">{formatDate(post.created_at)}</span>
              </div>
            </div>

            {user && user.id !== post.author_id && (
              <button 
                onClick={handleFollow}
                className={cn("btn-secondary flex items-center space-x-2", isFollowing && "bg-accent text-background")}
              >
                {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="post-content mb-24">
          <ReactMarkdown>{post.content || ''}</ReactMarkdown>
        </div>

        {/* Engagement Bar */}
        <div className="sticky bottom-12 z-10 bg-background/80 backdrop-blur-md border border-border p-4 rounded-full flex items-center justify-between shadow-2xl mb-24">
          <div className="flex items-center space-x-8 px-4">
            <button 
              onClick={handleLike}
              className={cn("flex items-center space-x-2 transition-colors", isLiked ? "text-red-400" : "text-muted hover:text-foreground")}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              <span className="font-medium">{post.likes_count || 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-muted hover:text-foreground transition-colors">
              <MessageCircle size={24} />
              <span className="font-medium">{comments.length}</span>
            </button>
          </div>
          <div className="flex items-center space-x-4 px-4 border-l border-border">
            <button className="text-muted hover:text-foreground transition-colors">
              <Bookmark size={24} />
            </button>
            <button className="text-muted hover:text-foreground transition-colors">
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <section className="border-t border-border pt-24">
          <h2 className="text-4xl font-serif mb-12">Conversations</h2>
          
          {user ? (
            <form onSubmit={handleComment} className="mb-16">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full bg-border/20 border border-border rounded-2xl p-6 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all mb-4"
              />
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">Post Comment</button>
              </div>
            </form>
          ) : (
            <div className="bg-border/20 border border-border rounded-2xl p-12 text-center mb-16">
              <p className="text-muted mb-6">Sign in to join the conversation.</p>
              <Link to="/auth" className="btn-primary">Sign In</Link>
            </div>
          )}

          <div className="space-y-12">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-6">
                <img src={comment.user?.avatar_url || ''} alt="" className="w-10 h-10 rounded-full border border-border flex-shrink-0" />
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium">{comment.user?.full_name || 'Anonymous'}</span>
                    <span className="text-xs text-muted">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
