import React, { useState } from 'react';
import UserProfilePopover from './UserProfilePopover';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const GeminiLayout = ({ children, onToggleTheme, currentUser, decks = [], loadDeck, onReset }) => {
  const [expandedSection, setExpandedSection] = useState('Recent Files');

  const recentDecks = decks.filter(d => !d.deleted);
  const starredDecks = decks.filter(d => d.starred && !d.deleted);
  const trashDecks = decks.filter(d => d.deleted);

  const handleToggleStar = async (e, deck) => {
    e.stopPropagation();
    try {
      const deckRef = doc(db, `users/${currentUser.uid}/decks`, deck.id);
      await updateDoc(deckRef, { starred: !deck.starred });
    } catch(err) { console.error(err); }
  };

  const handleToggleTrash = async (e, deck) => {
    e.stopPropagation();
    try {
      const deckRef = doc(db, `users/${currentUser.uid}/decks`, deck.id);
      await updateDoc(deckRef, { deleted: !deck.deleted, starred: false });
    } catch(err) { console.error(err); }
  };

  const handleDeletePermanent = async (e, deck) => {
    e.stopPropagation();
    try {
      const deckRef = doc(db, `users/${currentUser.uid}/decks`, deck.id);
      await deleteDoc(deckRef);
    } catch(err) { console.error(err); }
  };

  const renderDeckList = (deckList, section) => (
    <div className="mt-2 space-y-1 pl-4 mb-4">
      {deckList.length === 0 ? (
        <div className="px-5 py-2 text-xs text-[#C4C7C5] opacity-50 italic">Empty</div>
      ) : (
        deckList.map(deck => (
          <div 
            key={deck.id} 
            onClick={() => {
              if (section !== 'Trash' && loadDeck) loadDeck(deck);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm text-[#E3E3E3] hover:bg-[#28292A] rounded-lg ${section !== 'Trash' ? 'cursor-pointer' : ''} transition-colors group`}
          >
            <span className="truncate flex-1 max-w-[120px]" title={deck.fileName}>{deck.fileName}</span>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {section !== 'Trash' && (
                <>
                  <button onClick={(e) => handleToggleStar(e, deck)} className={`hover:text-yellow-400 ${deck.starred ? 'text-yellow-400 opacity-100' : 'text-[#C4C7C5]'}`}>
                    ★
                  </button>
                  <button onClick={(e) => handleToggleTrash(e, deck)} className="text-[#C4C7C5] hover:text-red-400" title="Move to Trash">
                    🗑
                  </button>
                </>
              )}
              {section === 'Trash' && (
                <>
                  <button onClick={(e) => handleToggleTrash(e, deck)} className="text-[#C4C7C5] hover:text-green-400" title="Restore">
                    ↺
                  </button>
                  <button onClick={(e) => handleDeletePermanent(e, deck)} className="text-[#C4C7C5] hover:text-red-500" title="Delete Permanently">
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const sections = [
    { name: 'Recent Files', data: recentDecks },
    { name: 'Starred', data: starredDecks },
    { name: 'Trash', data: trashDecks }
  ];
  return (
    <div className="flex h-screen bg-[#131314] text-[#E3E3E3] font-sans selection:bg-[#004A77] selection:text-[#A8C7FA] relative">

      {/* 1. SIDEBAR (Dark - Matches Light Theme Structure) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#1E1F20] p-6 h-full border-r border-[#444746]">

        {/* Title */}
        <div className="text-2xl font-bold text-[#E3E3E3] mb-10 tracking-tight">
          Flash Card Generator
        </div>

        {/* New Upload Button */}
        <div 
          className="flex items-center space-x-3 bg-[#004A77] hover:bg-[#005c94] transition-colors text-[#A8C7FA] px-5 py-4 rounded-2xl cursor-pointer mb-8 shadow-sm font-medium"
          onClick={onReset}
        >
          <span className="text-2xl leading-none">+</span>
          <span>New Upload</span>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-2 pb-4">
          {sections.map((section) => (
            <div key={section.name}>
              <div 
                onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                className="flex items-center justify-between px-5 py-3 text-[#C4C7C5] hover:bg-[#28292A] rounded-full cursor-pointer transition-colors font-medium"
              >
                <span>{section.name}</span>
                <span className="text-xs">{expandedSection === section.name ? '▼' : '▶'}</span>
              </div>
              {expandedSection === section.name && renderDeckList(section.data, section.name)}
            </div>
          ))}
        </nav>
        {/* User Profile Popover */}
        <div className="mt-auto">
          <UserProfilePopover currentUser={currentUser} theme="dark" />
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
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