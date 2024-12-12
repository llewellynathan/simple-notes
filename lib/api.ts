import { supabase } from './supabase';
import { Note } from '@/app/types/note';

export async function getNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createNote(title: string, content: string) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}