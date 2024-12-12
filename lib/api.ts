import { supabase } from './supabase';
import { Note } from '@/app/types/note';

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Note[]>();
  
  if (error) throw error;
  return data || [];
}

export async function createNote(title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single()
    .returns<Note>();
  
  if (error) throw error;
  if (!data) throw new Error('No data returned from insert');
  return data;
}

export async function updateNote(id: string, title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single()
    .returns<Note>();
  
  if (error) throw error;
  if (!data) throw new Error('No data returned from update');
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}