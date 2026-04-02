import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';
import { motion } from 'motion/react';
import { Save, Send, Image as ImageIcon, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-serif max-w-none min-h-[500px] focus:outline-none text-xl leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error) {
          setTitle(data.title);
          setExcerpt(data.excerpt || '');
          setCoverImage(data.cover_image || '');
          editor?.commands.setContent(data.content || '');
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [id, editor]);

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user || !title.trim()) return;
    
    setSaving(status === 'draft');
    setPublishing(status === 'published');

    const postData = {
      author_id: user.id,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: editor?.getHTML() || '',
      cover_image: coverImage.trim(),
      slug: slugify(title),
      status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select()
          .single();
        if (error) throw error;
        if (data) navigate(`/edit/${data.id}`, { replace: true });
      }
      
      if (status === 'published') {
        navigate(`/post/${postData.slug}`);
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass-nav px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-muted uppercase tracking-widest font-medium">
            {id ? 'Editing Post' : 'New Story'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleSave('draft')}
            disabled={saving || publishing}
            className="btn-secondary flex items-center space-x-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Draft</span>
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={saving || publishing}
            className="btn-primary flex items-center space-x-2"
          >
            {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>Publish</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24">
        {/* Cover Image Input */}
        <div className="mb-12 group relative">
          {coverImage ? (
            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-border">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setCoverImage('')}
                className="absolute top-4 right-4 bg-background/80 p-2 rounded-full hover:bg-background transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="aspect-[21/9] rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center space-y-4 hover:border-accent/50 transition-colors cursor-pointer bg-border/10">
              <ImageIcon size={48} className="text-muted" />
              <input 
                type="text" 
                placeholder="Paste cover image URL..." 
                className="bg-transparent text-center focus:outline-none w-full max-w-xs text-sm"
                onBlur={(e) => setCoverImage(e.target.value)}
              />
              <p className="text-xs text-muted">Recommended: 1920x820px</p>
            </div>
          )}
        </div>

        {/* Title Input */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-6xl md:text-8xl font-serif font-medium leading-tight focus:outline-none mb-8 resize-none overflow-hidden"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        {/* Excerpt Input */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a short excerpt..."
          className="w-full bg-transparent text-2xl text-muted font-light focus:outline-none mb-12 resize-none overflow-hidden"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />

        {/* Rich Text Editor */}
        <div className="min-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
