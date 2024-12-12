import { supabase } from './supabase';
import { Note } from '@/app/types/note';

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as Note[]) || [];
}

export async function createNote(title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('No data returned from insert');
  return data as Note;
}

export async function updateNote(id: string, title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('No data returned from update');
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}