import React from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { open } from '@tauri-apps/plugin-shell';

export const OllamaPromptDialog: React.FC = () => {
  const { isOllamaMissing, setOllamaMissing } = useSystemStore();

  if (!isOllamaMissing) return null;

  const handleDownload = async () => {
    try {
      await open('https://ollama.com/download');
      setOllamaMissing(false);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[450px] bg-classic-grey border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">AI Engine Setup</span>
          </div>
          <button 
            onClick={() => setOllamaMissing(false)}
            className="bg-classic-grey border border-t-white border-l-white border-b-black border-r-black px-1.5 text-black text-xs font-bold active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex flex-col space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-t-white border-l-white border-b-black border-r-black flex-shrink-0">
              ?
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-black font-bold text-sm leading-tight">
                AI Chat Engine Not Found
              </p>
              <p className="text-black text-xs leading-normal">
                To enable offline AI research and smart cataloging, you need to install the Ollama AI engine. Would you like to download it now?
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              onClick={handleDownload}
              className="px-4 py-1 bg-classic-grey border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm font-bold min-w-[100px] text-black"
            >
              Install AI
            </button>
            <button 
              onClick={() => setOllamaMissing(false)}
              className="px-4 py-1 bg-classic-grey border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm font-bold min-w-[100px] text-black"
            >
              Later
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-2 py-1 bg-classic-grey border-t border-white/50 text-[10px] text-gray-600 italic">
          AI Chat is an optional feature. System core remains functional without it.
        </div>
      </div>
    </div>
  );
};
