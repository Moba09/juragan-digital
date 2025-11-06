
import React, { useState, useMemo, useEffect } from 'react';
import ToolCard from './components/ToolCard';
import Modal from './components/Modal';
import AIToolRunner from './components/AIToolRunner';
import Chatbot from './components/Chatbot';
import { CATEGORIES, TOOLS } from './constants';
import { Category, Tool } from './types';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [bookmarkedTools, setBookmarkedTools] = useState<number[]>(() => {
    try {
      const savedBookmarks = localStorage.getItem('bookmarkedTools');
      return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    } catch (error) {
      console.error("Could not parse bookmarks from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedTools', JSON.stringify(bookmarkedTools));
  }, [bookmarkedTools]);

  const toggleBookmark = (toolId: number) => {
    setBookmarkedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId) 
        : [...prev, toolId]
    );
  };

  const filteredTools = useMemo(() => {
    if (activeCategory === 'bookmarks') {
      return TOOLS.filter(tool => bookmarkedTools.includes(tool.id));
    }
    if (activeCategory === 'all') {
      return TOOLS;
    }
    return TOOLS.filter(tool => tool.category === activeCategory);
  }, [activeCategory, bookmarkedTools]);

  const handleTryNow = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleCloseModal = () => {
    setSelectedTool(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <header className="text-center mb-12">
            <div className="flex justify-center mb-6">
                <img 
                    src="https://raw.githubusercontent.com/Ade-Wahyudi/juragan-digital-showcase/main/src/assets/profile.png" 
                    alt="Logo Juragan Digital" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                JURAGAN DIGITAL SHOWCASE
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
                Koleksi Tools AI untuk Produktivitas Digital
            </p>
            <p className="mt-1 text-sm text-slate-500">
                Ade Wahyudi | Sahabat Bertumbuh
            </p>
        </header>

        {/* Filter Controls */}
        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {CATEGORIES.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105
                ${activeCategory === category.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              {React.cloneElement(category.icon, { 
                  className: `w-4 h-4 ${activeCategory === category.id ? 'text-white' : 'text-slate-500'}`,
                  style: category.id === 'bookmarks' && activeCategory === category.id ? { fill: 'white', stroke: 'white' } : category.id === 'bookmarks' ? { fill: 'currentColor' } : {}
              })}
              {category.name}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onTryNow={handleTryNow} 
              isBookmarked={bookmarkedTools.includes(tool.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
        {activeCategory === 'bookmarks' && filteredTools.length === 0 && (
          <div className="text-center col-span-1 md:col-span-2 lg:col-span-3 py-16">
            <h3 className="text-xl font-semibold text-slate-700">Tidak Ada Alat yang Disimpan</h3>
            <p className="text-slate-500 mt-2">Klik ikon bookmark pada alat untuk menyimpannya di sini.</p>
          </div>
        )}
      </main>
      
      {/* Footer Section */}
      <footer className="text-center py-8">
        <p className="text-sm text-slate-500">
            © 2025 Juragan Digital Showcase. Dibuat dengan <span className="text-red-500">❤️</span> untuk produktivitas digital
        </p>
      </footer>

      {/* Chatbot */}
      <Chatbot />

      {/* Modal for Tool Runner */}
      {selectedTool && (
        <Modal title={selectedTool.title} onClose={handleCloseModal}>
          <AIToolRunner tool={selectedTool} />
        </Modal>
      )}
    </div>
  );
};

export default App;