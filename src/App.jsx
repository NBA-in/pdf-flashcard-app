import React, { useState, useEffect } from 'react';
// Dark Components
import GeminiLayout from './components/GeminiLayout';
import UploadScreen from './components/UploadScreen';
// Light Components
import GeminiLightLayout from './components/GeminiLightLayout';
import UploadScreenLight from './components/UploadScreenLight';
// Shared Components
import MaterialSpinner from './components/MaterialSpinner';
import FlashcardViewer from './components/FlashcardViewer';
import { generateFlashcards } from './gemini';

function App() {
  const [appState, setAppState] = useState('idle');
  const [flashcards, setFlashcards] = useState([]);

  // --- FIX: Initialize Theme from Local Storage ---
  // If 'theme' exists in storage, use it. Otherwise default to 'dark'.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // --- FIX: Save Theme to Storage whenever it changes ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFileUpload = async (file) => {
    setAppState('loading');
    try {
      const cards = await generateFlashcards(file);
      setFlashcards(cards);
      setAppState('finished');
    } catch (error) {
      console.error(error);
      setAppState('idle');
      alert("Failed to generate cards. Check console.");
    }
  };

  // Helper to choose the right Layout Wrapper
  const ActiveLayout = theme === 'light' ? GeminiLightLayout : GeminiLayout;

  return (
    <div className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#131314] text-[#E3E3E3]'}>
      
      {appState === 'idle' && (
        <ActiveLayout onToggleTheme={toggleTheme} currentTheme={theme}>
          {theme === 'light' ? (
             <UploadScreenLight onUpload={handleFileUpload} />
          ) : (
             <UploadScreen onUpload={handleFileUpload} />
          )}
        </ActiveLayout>
      )}

      {/* Loading Spinner (Now accepts theme prop) */}
      {appState === 'loading' && (
         <MaterialSpinner theme={theme} />
      )}

      {appState === 'finished' && (
        <ActiveLayout onToggleTheme={toggleTheme} currentTheme={theme}>
           <FlashcardViewer 
              data={flashcards} 
              onReset={() => setAppState('idle')} 
              theme={theme}
           />
        </ActiveLayout>
      )}
    </div>
  );
}

export default App;