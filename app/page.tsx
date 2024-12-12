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
import { MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const truncateContent = (content: string): string => {
  return content;
};

export default function Home() {
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
                {note.title}
              </CardTitle>
              <div className="flex gap-2">
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white border-none !bg-white">
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p>
              This action cannot be undone. This will permanently delete your note
              &quot;{noteToDelete?.title}&quot;.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
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

      <Dialog 
        open={!!summaryNote} 
        onOpenChange={(open) => !open && setSummaryNote(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white border-none !bg-white">
          <DialogHeader>
            <DialogTitle>AI Summary: {summaryNote?.title}</DialogTitle>
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
