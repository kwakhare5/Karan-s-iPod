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
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-[#E5E5E5]">
          <input
            className="w-full text-[17px] font-semibold tracking-[-0.015em] text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
            placeholder="Title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="flex-1 px-4 py-3">
          <textarea
            className="w-full h-full text-[15px] font-medium leading-relaxed text-gray-600 bg-transparent outline-none resize-none placeholder:text-gray-300"
            placeholder="Start writing..."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          />
        </div>
        <div className="p-4 flex gap-3 mt-auto mb-4 border-t border-[#E5E5E5] bg-white">
          <button
            className="flex-1 h-10 rounded-lg bg-gray-100 text-gray-900 font-semibold active:bg-gray-200 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`flex-1 h-10 rounded-lg font-semibold transition-colors ${
              title
                ? 'bg-[#007AFF] text-white active:bg-blue-600'
                : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
            onClick={() => {
              if (title) onSave();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
