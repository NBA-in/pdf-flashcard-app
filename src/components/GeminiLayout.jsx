// src/components/GeminiLayout.jsx
import React from 'react';

const GeminiLayout = ({ children, onToggleTheme }) => {
  return (
    <div className="flex h-screen bg-[#131314] text-[#E3E3E3] font-sans selection:bg-[#004A77] selection:text-[#A8C7FA] relative">
      
      {/* 1. SIDEBAR (Dark - Matches Light Theme Structure) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#1E1F20] p-6 h-full border-r border-[#444746]">
        
        {/* Title */}
        <div className="text-2xl font-bold text-[#E3E3E3] mb-10 tracking-tight">
          Flashcard AI
        </div>

        {/* New Upload Button */}
        <div className="flex items-center space-x-3 bg-[#004A77] hover:bg-[#005c94] transition-colors text-[#A8C7FA] px-5 py-4 rounded-2xl cursor-pointer mb-8 shadow-sm font-medium">
          <span className="text-2xl leading-none">+</span>
          <span>New Upload</span>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2 flex-1">
          {['Recent Files', 'Starred', 'Trash', 'Settings'].map((item) => (
            <div key={item} className="px-5 py-3 text-[#C4C7C5] hover:bg-[#28292A] rounded-full cursor-pointer transition-colors font-medium">
              {item}
            </div>
          ))}
        </nav>
        
        {/* User Profile Stub */}
        <div className="mt-auto flex items-center space-x-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-[#A8C7FA] text-[#004A77] flex items-center justify-center text-sm font-bold">U</div>
          <span className="text-sm font-medium text-[#E3E3E3]">User Account</span>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto relative">
        
        {/* --- TOGGLE BUTTON (Moon Icon) --- */}
              <div className="absolute top-6 right-8">
                <button 
                  onClick={onToggleTheme}
                  className="p-2 rounded-full bg-[#28292A] hover:bg-[#3C4043] text-[#E3E3E3] transition-all border border-[#444746]"
                  title="Switch to Light Mode"
                >
                  {/* MOON ICON */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
              </div>

        {/* Content Wrapper - Matches Light Theme Max Width */}
        <div className="w-full max-w-5xl mt-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default GeminiLayout;