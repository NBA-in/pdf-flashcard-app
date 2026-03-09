import React, { useState, useEffect } from 'react';
// Dark Components
import GeminiLayout from './components/GeminiLayout';
import UploadScreen from './components/UploadScreen';
// Light Components
import GeminiLightLayout from './components/GeminiLightLayout';
import UploadScreenLight from './components/UploadScreenLight';
// Shared Components
//import AlchemyLoader from './components/AlchemyLoader';
import FlashcardViewer from './components/FlashcardViewer';
import AuthScreen from './components/AuthScreen';
import { generateInitialFlashcards, generateRemainingFlashcards } from './gemini';
import { useAuth } from './context/AuthContext';
import { auth, db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

function App() {
  const [appState, setAppState] = useState('idle');
  const [flashcards, setFlashcards] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [decks, setDecks] = useState([]);
  const [currentDeckId, setCurrentDeckId] = useState(null);
  const [duplicateDialog, setDuplicateDialog] = useState({ isOpen: false, file: null, baseName: '', count: 0, exactDeck: null });

  const { currentUser } = useAuth();

  // --- FIX: Initialize Theme from Local Storage or System Preference ---
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default to light if no preference
  });

  // --- FIX: Save Theme to Storage whenever it changes ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Firestore listener for decks
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, `users/${currentUser.uid}/decks`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDecks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDecks(fetchedDecks);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFileUpload = async (file, forceNew = false) => {
    setAppState('loading');

    // Default the title to the file name, stripping the .pdf extension for a cleaner look
    const nameWithoutExt = file.name ? file.name.replace(/\.[^/.]+$/, "") : "Your PDF Deck";
    
    // Check for collisions
    if (!forceNew) {
      const match = nameWithoutExt.match(/^(.*?)(?:\(\d+\))?$/);
      const baseName = match ? match[1].trim() : nameWithoutExt;
      
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingDecks = decks.filter(deck => {
        if (!deck.fileName) return false;
        if (deck.fileName === nameWithoutExt) return true; // Include exact matches specifically
        if (deck.fileName === baseName) return true;
        const rx = new RegExp(`^${escapedBaseName}\\(\\d+\\)$`);
        return rx.test(deck.fileName);
      });

      const exactDeck = decks.find(deck => deck.fileName === nameWithoutExt);

      if (exactDeck) {
        setDuplicateDialog({
          isOpen: true,
          file: file,
          baseName: baseName,
          count: matchingDecks.length,
          exactDeck: exactDeck
        });
        setAppState('idle');
        return;
      }
    }

    let finalFileName = nameWithoutExt;
    if (forceNew) {
       finalFileName = `${duplicateDialog.baseName}(${duplicateDialog.count})`;
       setDuplicateDialog({ isOpen: false, file: null, baseName: '', count: 0, exactDeck: null });
    }
    
    setFileName(finalFileName);

    try {
      // Phase 1: Generate initial set (fast)
      const initialCards = await generateInitialFlashcards(file, 5);
      setFlashcards(initialCards);
      
      const newDeckRef = doc(collection(db, `users/${currentUser.uid}/decks`));
      setCurrentDeckId(newDeckRef.id);
      await setDoc(newDeckRef, {
        fileName: finalFileName,
        flashcards: initialCards,
        createdAt: serverTimestamp(),
        starred: false,
        deleted: false
      });

      setAppState('finished');
      setIsGeneratingMore(true);

      // Phase 2: Generate remaining cards (background)
      generateRemainingFlashcards(file, initialCards)
        .then((newCards) => {
          if (newCards && newCards.length > 0) {
            setFlashcards((prev) => {
              const updatedCards = [...prev, ...newCards];
              updateDoc(newDeckRef, {
                flashcards: updatedCards
              }).catch(console.error);
              return updatedCards;
            });
          }
        })
        .catch(console.error)
        .finally(() => setIsGeneratingMore(false));

    } catch (error) {
      console.error(error);
      setAppState('idle');
      alert("Failed to generate cards. Check console.");
    }
  };

  // Helper to choose the right Layout Wrapper
  const ActiveLayout = theme === 'light' ? GeminiLightLayout : GeminiLayout;

  if (!currentUser) {
    return (
      <div className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#131314] text-[#E3E3E3]'}>
        <AuthScreen theme={theme} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  const totalCardsCreated = decks.filter(d => !d.deleted).reduce((acc, curr) => acc + (curr.flashcards ? curr.flashcards.length : 0), 0);

  const loadDeck = (deck) => {
    setFileName(deck.fileName);
    setFlashcards(deck.flashcards || []);
    setCurrentDeckId(deck.id);
    setAppState('finished');
    setIsGeneratingMore(false);
  };

  const handleReset = () => {
    setAppState('idle');
    setIsGeneratingMore(false);
    setCurrentDeckId(null);
  };

  return (
    <div className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#131314] text-[#E3E3E3]'}>

      {/* Duplicate Dialog */}
      {duplicateDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'light' ? 'bg-white text-[#1F1F1F]' : 'bg-[#1E1F20] text-[#E3E3E3]'} p-8 rounded-3xl max-w-md w-full shadow-2xl border ${theme === 'light' ? 'border-[#E0E2E5]' : 'border-[#444746]'}`}>
            <h2 className="text-2xl font-bold mb-4">A deck for this PDF already exists.</h2>
            <p className={`mb-8 ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>
              You have already generated flashcards for "{duplicateDialog.exactDeck?.fileName}". What would you like to do?
            </p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => loadDeck(duplicateDialog.exactDeck)}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]' : 'bg-[#A8C7FA] text-[#004A77] hover:bg-[#D3E3FD]'}`}>
                Take me there
              </button>
              <button 
                onClick={() => handleFileUpload(duplicateDialog.file, true)}
                className={`w-full py-3 rounded-xl font-bold transition-colors border ${theme === 'light' ? 'border-[#E0E2E5] text-[#444746] hover:bg-[#F0F4F9]' : 'border-[#444746] text-[#E3E3E3] hover:bg-[#28292A]'}`}>
                Generate New Flashcards
              </button>
              <button 
                onClick={() => {
                  setDuplicateDialog({ isOpen: false, file: null, baseName: '', count: 0, exactDeck: null });
                  setAppState('idle');
                }}
                className={`w-full py-3 rounded-xl font-bold transition-colors text-red-500 ${theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'idle' && (
        <ActiveLayout onToggleTheme={toggleTheme} currentTheme={theme} currentUser={currentUser} decks={decks} loadDeck={loadDeck} onReset={handleReset}>
          {theme === 'light' ? (
            <UploadScreenLight onUpload={handleFileUpload} currentUser={currentUser} totalCardsCreated={totalCardsCreated} />
          ) : (
            <UploadScreen onUpload={handleFileUpload} currentUser={currentUser} totalCardsCreated={totalCardsCreated} />
          )}
        </ActiveLayout>
      )}

      {(appState === 'finished' || appState === 'loading') && (
        <ActiveLayout onToggleTheme={toggleTheme} currentTheme={theme} currentUser={currentUser} decks={decks} loadDeck={loadDeck} onReset={handleReset}>
          <FlashcardViewer
            data={flashcards}
            onReset={handleReset}
            theme={theme}
            defaultTitle={fileName}
            isGeneratingMore={isGeneratingMore}
            currentDeckId={currentDeckId}
            isLoadingInitial={appState === 'loading'}
          />
        </ActiveLayout>
      )}
    </div>
  );
}

export default App;