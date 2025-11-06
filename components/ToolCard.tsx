import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onTryNow: (tool: Tool) => void;
  isBookmarked: boolean;
  onToggleBookmark: (toolId: number) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onTryNow, isBookmarked, onToggleBookmark }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(tool.id);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col h-full transform hover:-translate-y-1 relative">
      <button
        onClick={handleBookmarkClick}
        className={`absolute top-4 right-4 p-1 rounded-full transition-colors z-10 ${isBookmarked ? 'text-amber-500 bg-amber-100' : 'text-slate-400 hover:bg-slate-100'}`}
        aria-label={isBookmarked ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      </button>

      {tool.icon}
      <h3 className="text-xl font-bold text-slate-800 mt-4 mb-2">{tool.title}</h3>
      <p className="text-slate-500 text-sm mb-4 flex-grow">{tool.description}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {tool.tags.map((tag) => (
          <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <button 
        onClick={() => onTryNow(tool)}
        className="mt-auto w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center group">
        Coba Sekarang
        <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
      </button>
    </div>
  );
};

export default ToolCard;