
import React from 'react';

// AIChat Component Deprecated
// The imports from @google/genai have been removed to prevent module resolution errors
// since the SDK was removed from index.html.

interface AIChatProps {
  onBack: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <p className="text-gray-500 mb-4">AI 助手功能已停用</p>
      <button 
        onClick={onBack}
        className="px-4 py-2 bg-gray-100 rounded-lg text-sm"
      >
        返回
      </button>
    </div>
  );
};
