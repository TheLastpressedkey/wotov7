import { supabase } from '../lib/database';
import type { User } from '../types/auth';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error('Authentication failed');
    }

    if (!user) {
      throw new Error('No user data returned');
    }

    return {
      id: user.id,
      email: user.email!,
      role: 'admin',
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async checkAuthState() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  },
};