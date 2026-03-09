// src/components/UploadScreen.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';


const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const UploadScreen = ({ onUpload, currentUser, totalCardsCreated = 0 }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(""); // Clear previous errors

    // Handle rejected files (e.g., wrong type or too many)
    if (rejectedFiles && rejectedFiles.length > 0) {
      // Check the specific rejection reason
      const rejectionStr = JSON.stringify(rejectedFiles[0]);
      if (rejectionStr.includes('file-invalid-type') || rejectionStr.includes('application/pdf')) {
        setError("Upload PDF files only.");
      } else {
        setError("Please upload a single PDF file.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const acceptedFile = acceptedFiles[0];
      if (acceptedFile.size > MAX_FILE_SIZE) {
        setError("File is too large! Please upload a PDF smaller than 4MB.");
        return;
      }
      setFile(acceptedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="flex flex-col items-center w-full">

      {/* Header Section */}
      <div className="w-full max-w-2xl mb-12">
        <h1 className="text-5xl font-bold text-[#E3E3E3] mb-4 tracking-tight">
          Hello, <span className="text-[#A8C7FA]">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}</span>
        </h1>
        <p className="text-[#C4C7C5] text-xl font-light">
          What are we studying today? Upload a PDF to generate AI flashcards instantly.
        </p>
      </div>

      {/* The Upload Card (Dark Version) */}
      <div className="w-full bg-[#1E1F20] border-2 border-[#444746] rounded-[32px] p-6 sm:p-12 mb-12 relative overflow-hidden group hover:border-[#A8C7FA] transition-all duration-300">

        {file ? (
          // --- STAGED FILE VIEW ---
          <div className="border-2 border-solid border-[#A8C7FA] bg-[#131314] rounded-[24px] h-80 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-[#E3E3E3] mb-2 px-4 truncate max-w-full">
              {file.name}
            </h3>
            <p className="text-[#A8C7FA] mb-8 font-mono">
              Ready to generate!
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setFile(null)}
                className="px-6 py-3 rounded-full font-bold text-[#E3E3E3] border border-[#444746] hover:bg-[#28292A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onUpload(file)}
                className="px-8 py-3 rounded-full font-bold bg-[#A8C7FA] text-[#004A77] hover:bg-[#D3E3FD] transition-colors shadow-lg active:scale-95 flex items-center"
              >
                <span>Generate Flashcards</span>
                <span className="ml-2 text-xl">✨</span>
              </button>
            </div>
          </div>
        ) : (
          // --- DROP ZONE VIEW ---
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-[24px] h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragActive
                ? 'bg-[#28292A] border-[#A8C7FA] scale-[0.99]'
                : 'bg-[#131314] border-[#444746] hover:bg-[#28292A]'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Cloud Icon */}
            <div className={`text-7xl mb-6 transition-transform duration-300 ${isDragActive ? 'scale-110 -translate-y-2' : ''}`}>
              ☁️
            </div>

            <h3 className="text-2xl font-bold text-[#E3E3E3] mb-2">
              {isDragActive ? "Drop it like it's hot!" : "Drag & drop PDF here"}
            </h3>
            <p className="text-[#C4C7C5] text-lg mb-4">or click to browse files</p>

            {/* Constraints display */}
            <div className="flex items-center space-x-4 mt-2">
              <span className="px-3 py-1 bg-[#1E1F20] text-[#A8C7FA] text-xs font-mono font-bold rounded-md uppercase tracking-wider border border-[#444746]">
                Max 1 File
              </span>
              <span className="px-3 py-1 bg-[#1E1F20] text-[#A8C7FA] text-xs font-mono font-bold rounded-md uppercase tracking-wider border border-[#444746]">
                &lt; 4 MB Size
              </span>
            </div>

            {error && (
              <p className="mt-6 text-red-400 font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Stats Cards (Dark Version) */}
      <div className="w-full grid grid-cols-1 gap-6">
        {/* Card 1 */}
        <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#C4C7C5] text-sm font-medium uppercase tracking-wider mb-2">Flashcards Created</div>
          <div className="text-4xl font-bold text-[#E3E3E3]">{totalCardsCreated.toLocaleString()}</div>
        </div>
      </div>

    </div>
  );
};

export default UploadScreen;