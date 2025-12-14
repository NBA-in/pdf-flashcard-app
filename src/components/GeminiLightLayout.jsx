import React from 'react';

const GeminiLightLayout = ({ children, onToggleTheme }) => {
  return (
    <div className="flex h-screen bg-white text-[#1F1F1F] font-sans selection:bg-[#D3E3FD] selection:text-[#0B57D0] relative">
      
      {/* 1. SIDEBAR (Light Theme) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#F0F4F9] p-6 h-full">
        
        {/* Title */}
        <div className="text-2xl font-bold text-[#1F1F1F] mb-10 tracking-tight">
          Flashcard AI
        </div>

        {/* New Upload Button */}
        <div className="flex items-center space-x-3 bg-[#D3E3FD] hover:bg-[#c2d7fc] transition-colors text-[#0B57D0] px-5 py-4 rounded-2xl cursor-pointer mb-8 shadow-sm font-medium">
          <span className="text-2xl leading-none">+</span>
          <span>New Upload</span>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2 flex-1">
          {['Recent Files', 'Starred', 'Trash', 'Settings'].map((item) => (
            <div key={item} className="px-5 py-3 text-[#444746] hover:bg-[#E1E5EA] rounded-full cursor-pointer transition-colors font-medium">
              {item}
            </div>
          ))}
        </nav>
        
        {/* --- ADDED THIS SECTION (User Profile Stub) --- */}
        <div className="mt-auto flex items-center space-x-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-sm font-bold">U</div>
          <span className="text-sm font-medium text-[#1F1F1F]">User Account</span>
        </div>

      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto relative">
         
         {/* Toggle Button (Sun Icon for Light Mode) */}
         <div className="absolute top-6 right-8">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#444746] transition-all border border-[#E0E2E5]"
              title="Switch to Dark Mode"
            >
               {/* Sun Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
            </button>
         </div>

        <div className="w-full max-w-5xl mt-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default GeminiLightLayout;