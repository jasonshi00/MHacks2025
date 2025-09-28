import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';

interface CodeDisplayProps {
  code: string | null;
  isLoading: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, isLoading }) => {
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    }, () => {
      setCopyText('Failed to copy');
    });
  };

  return (
    <div className="mt-8 bg-gray-800 rounded-xl shadow-lg relative border border-gray-700">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900/50 rounded-t-xl border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-300">Generated Flask Code</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
          disabled={copyText !== 'Copy' || isLoading}
        >
          <ClipboardIcon className="w-4 h-4" />
          {copyText}
        </button>
      </div>
      <div className="p-4 overflow-x-auto min-h-[120px]">
        {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="animate-spin h-5 w-5 mr-3 text-indigo-400" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating with AI...</span>
            </div>
          ) : (
            <pre><code className="text-sm text-white font-mono whitespace-pre-wrap">{code || ''}</code></pre>
        )}
      </div>
    </div>
  );
};

export default CodeDisplay;
