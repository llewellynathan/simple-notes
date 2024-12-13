'use client'

import { useEffect } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Note } from "./types/note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreVertical, Loader2, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const truncateContent = (content: string): string => {
  return content;
};

export default function Home() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [summaryNote, setSummaryNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadNotes();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Show error state to user
        setNotes([]);
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await getNotes();
      setNotes(notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    setError(null); // Clear any previous errors
    
    if (!newTitle.trim()) {
      setError('Please add a title to your note');
      return;
    }
    
    if (!newContent.trim()) {
      setError('Please add content to your note before saving');
      return;
    }

    try {
      const newNote = await createNote(newTitle, newContent);
      setNotes([newNote, ...notes]);
      setNewTitle('');
      setNewContent('');
      setError(null); // Clear error on success
    } catch (error) {
      console.error('Failed to create note:', error);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
  };

  const handleUpdateNote = async () => {
    setError(null); // Clear any previous errors
    
    if (!newTitle.trim()) {
      setError('Please add a title to your note');
      return;
    }
    
    if (!newContent.trim()) {
      setError('Please add content to your note before saving');
      return;
    }

    if (!editingId) return;

    try {
      const updatedNote = await updateNote(editingId, newTitle, newContent);
      setNotes(notes.map(note => 
        note.id === editingId ? updatedNote : note
      ));
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      setError(null); // Clear error on success
    } catch (error) {
      console.error('Failed to update note:', error);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const handleAISummary = async (note: Note) => {
    setSummaryNote(note);
    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note.content }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to get summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Simple Notes</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create/Edit Note Section */}
      <Card className="mb-8 bg-white">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Note' : 'Create New Note'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Note title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your note here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            {editingId ? (
              <>
                <Button onClick={handleUpdateNote}>Update Note</Button>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </>
            ) : (
              <Button onClick={handleCreateNote}>Save Note</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-center text-muted-foreground">No notes yet. Create one above!</p>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="bg-white">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">
                  {note.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewNote(note)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNote(note)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAISummary(note)}
                  >
                    AI Summary
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(note)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(note.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Note Dialog */}
      <Dialog 
        open={!!selectedNote} 
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <DialogContent className="max-w-[calc(100%-32px)] max-h-[80vh] overflow-y-auto bg-white border-none !bg-white rounded-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="text-left">
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
            {selectedNote && (
              <p className="text-xs text-muted-foreground mt-4">
                Created: {new Date(selectedNote.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNote(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[calc(100%-32px)] max-h-[80vh] overflow-y-auto bg-white border-none !bg-white rounded-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="text-left">
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete your note
              &quot;{noteToDelete?.title}&quot;.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                if (noteToDelete) {
                  handleDeleteNote(noteToDelete.id);
                }
                setIsDeleteDialogOpen(false);
                setNoteToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Summary Dialog */}
      <Dialog 
        open={!!summaryNote} 
        onOpenChange={(open) => !open && setSummaryNote(null)}
      >
        <DialogContent className="max-w-[calc(100%-32px)] max-h-[80vh] overflow-y-auto bg-white border-none !bg-white rounded-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="text-left">
            <DialogTitle>{summaryNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            {isSummarizing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Generating summary...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{summary}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryNote(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
