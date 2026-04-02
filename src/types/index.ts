export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  author?: Profile;
  likes_count?: number;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  user?: Profile;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
}
