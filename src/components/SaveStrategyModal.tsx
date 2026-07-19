import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface SaveStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const SaveStrategyModal: React.FC<SaveStrategyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 w-96 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-gray-950">
          <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Save Strategy</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase font-bold tracking-tight">Strategy Name</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My RSI Reversion"
              className="bg-gray-950 border border-gray-700 p-2 text-white outline-none focus:border-accent-cyan transition-colors font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-bold uppercase bg-accent-cyan/20 text-accent-cyan border border-accent-cyan hover:bg-accent-cyan/30 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
