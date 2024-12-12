'use client'

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

const truncateContent = (content: string): string => {
  return content;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleCreateNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      createdAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
  };

  const handleUpdateNote = () => {
    if (!editingId || !newTitle.trim() || !newContent.trim()) return;

    setNotes(notes.map(note => 
      note.id === editingId 
        ? { ...note, title: newTitle, content: newContent }
        : note
    ));
    
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Simple Notes</h1>
      
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
        {notes.map((note) => (
          <Card key={note.id} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">
                <span 
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => handleViewNote(note)}
                >
                  {note.title}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditNote(note)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note
                        &quot;{note.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Created: {note.createdAt.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Note Dialog */}
      <Dialog 
        open={!!selectedNote} 
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
            {selectedNote && (
              <p className="text-xs text-muted-foreground mt-4">
                Created: {selectedNote.createdAt.toLocaleDateString()}
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
    </div>
  );
}
