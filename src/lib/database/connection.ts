import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { databaseConfig } from './config';

export const supabase = createClient<Database>(
  databaseConfig.url,
  databaseConfig.anonKey,
  databaseConfig.options
);

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};