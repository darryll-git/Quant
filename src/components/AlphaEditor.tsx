import React from 'react';
import Editor from '@monaco-editor/react';

interface AlphaEditorProps {
  alphaType: 'Python' | 'Math';
  setAlphaType: (type: 'Python' | 'Math') => void;
  alphaCode: string;
  setAlphaCode: (code: string) => void;
}

export const AlphaEditor: React.FC<AlphaEditorProps> = ({ alphaType, setAlphaType, alphaCode, setAlphaCode }) => {
  const language = alphaType === 'Python' ? 'python' : 'javascript'; // Use JS for Math highlighting

  return (
    <div className="flex flex-col h-full w-full bg-panel">
      {/* Header */}
      <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Alpha Engine</span>
        <div className="flex gap-2 text-[10px]">
          <button 
            className={`px-3 py-1 rounded-sm transition-colors ${alphaType === 'Python' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan' : 'text-gray-500 hover:text-white border border-transparent'}`}
            onClick={() => setAlphaType('Python')}
          >
            Python
          </button>
          <button 
            className={`px-3 py-1 rounded-sm transition-colors ${alphaType === 'Math' ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow' : 'text-gray-500 hover:text-white border border-transparent'}`}
            onClick={() => setAlphaType('Math')}
          >
            Math
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="px-2 py-1 text-[9px] text-gray-500 bg-black/40 border-b border-gray-800 flex gap-4">
        <span>Available Variables:</span>
        <span className="text-gray-400">price, smaShort, smaLong, position (0 or 1), prevShort, prevLong</span>
        <span className="ml-auto text-accent-yellow italic">Return 'BUY', 'SELL', or 'HOLD'</span>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={alphaCode}
          onChange={(value) => setAlphaCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'JetBrains Mono',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 8, bottom: 8 },
            suggestOnTriggerCharacters: false,
            quickSuggestions: false,
          }}
        />
      </div>
    </div>
  );
};
