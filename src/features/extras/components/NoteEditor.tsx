import React from 'react';
import { StatusBar } from '@shared/components/StatusBar';

interface NoteEditorProps {
  isEditing: boolean;
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isPlaying: boolean;
  hasActiveTrack: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  isEditing,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  isPlaying,
  hasActiveTrack,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <StatusBar
        title={isEditing ? 'Edit Note' : 'New Note'}
        isPlaying={isPlaying}
        hasActiveTrack={hasActiveTrack}
        theme="light"
      />
      <div className="flex-1 flex flex-col gap-2 p-4">
        <input
          className="border p-1 rounded text-sm text-black"
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <textarea
          className="border p-1 rounded text-sm text-black flex-1 resize-none"
          placeholder="Content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button className="bg-gray-300 text-black p-1 rounded flex-1" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white p-1 rounded flex-1"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
