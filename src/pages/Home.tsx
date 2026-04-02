import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-9xl font-serif tracking-tighter leading-none mb-12"
        >
          The <br /> <span className="italic">Aether</span> <br /> Journal
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-muted max-w-2xl font-light"
        >
          A digital sanctuary for long-form storytelling, artistic expression, and the exploration of ideas.
        </motion.p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative flex flex-col",
              index % 3 === 0 ? "md:col-span-8" : "md:col-span-4",
              index % 5 === 0 ? "md:col-span-12 md:flex-row md:items-center md:space-x-12" : ""
            )}
          >
            <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-lg mb-6 flex-grow">
              {post.cover_image ? (
                <img 
                  src={post.cover_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover aspect-[16/9] group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full aspect-[16/9] bg-border flex items-center justify-center text-muted italic font-serif">
                  No cover image
                </div>
              )}
            </Link>

            <div className={cn(
              "flex flex-col",
              index % 5 === 0 ? "md:w-1/2" : ""
            )}>
              <div className="flex items-center space-x-4 mb-4 text-sm text-muted uppercase tracking-widest">
                <Link to={`/profile/${post.author?.username || post.author_id}`} className="hover:text-foreground transition-colors">
                  {post.author?.full_name || 'Anonymous'}
                </Link>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>

              <Link to={`/post/${post.slug}`} className="group-hover:opacity-80 transition-opacity">
                <h2 className={cn(
                  "font-serif leading-tight mb-4",
                  index % 3 === 0 ? "text-4xl md:text-6xl" : "text-3xl"
                )}>
                  {post.title}
                </h2>
                <p className="text-muted text-lg line-clamp-3 mb-6 font-light">
                  {post.excerpt}
                </p>
              </Link>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                <div className="flex items-center space-x-6 text-muted">
                  <button className="flex items-center space-x-2 hover:text-foreground transition-colors">
                    <Heart size={18} />
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-foreground transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.comments_count || 0}</span>
                  </button>
                </div>
                <button className="text-muted hover:text-foreground transition-colors">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
