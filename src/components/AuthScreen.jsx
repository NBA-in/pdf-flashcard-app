import React, { useState } from 'react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const AuthScreen = ({ theme, onToggleTheme }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState('login'); // 'login', 'signup'

    // Compute Password Requirements (Real-time)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmail = emailRegex.test(email);
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

    // A helper to get the right icon based on the state and whether the user has started typing
    const getRequirementIcon = (isMet, isTyping) => {
        if (!isTyping) return <span className="text-[#444746] mr-2">○</span>; // Default state
        if (isMet) return <span className="text-green-500 font-bold mr-2">✓</span>; // Success
        return <span className="text-red-500 font-bold mr-2">✗</span>; // Failed
    };

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { authError, setAuthError } = useAuth(); // Display any redirect errors

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setAuthError('');
        setLoading(true);

        try {
            // Frontend validation before hitting Firebase
            if (!hasValidEmail) {
                setError("Please enter a valid email address.");
                setLoading(false);
                return;
            }

            if (mode === 'signup') {
                if (!hasMinLength || !hasNumber || !hasUppercase) {
                    setError("Please ensure your password meets all constraints.");
                    setLoading(false);
                    return;
                }
                if (!passwordsMatch) {
                    setError("Passwords do not match. Please try again.");
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: displayName || "User" });
            } else if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            let errorMessage = "An error occurred. Please try again later.";

            // Map common Firebase errors to user-friendly messages
            const errStr = String(err.code || err.message || '');

            if (errStr.includes('auth/invalid-credential') || errStr.includes('auth/wrong-password')) {
                errorMessage = "Incorrect password or this account doesn't exist. Please check your credentials or Sign Up.";
            } else if (errStr.includes('auth/user-not-found')) {
                errorMessage = "We couldn't find an account for that email. Check your spelling or click Sign Up.";
            } else if (errStr.includes('auth/email-already-in-use')) {
                errorMessage = "An account with this email already exists. Please switch to the Log In tab.";
            } else if (errStr.includes('auth/weak-password')) {
                errorMessage = "Your password is too weak. Please use at least 6 characters.";
            } else if (errStr.includes('auth/invalid-email')) {
                errorMessage = "The email address is improperly formatted.";
            } else if (errStr.includes('auth/missing-password')) {
                errorMessage = "Please enter your password.";
            } else if (errStr.includes('auth/missing-email')) {
                errorMessage = "Please enter your email address.";
            } else if (err.message) {
                errorMessage = err.message; // Fallback to raw message if unmapped
            }

            setError(errorMessage);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 relative">

            {/* Theme Toggle Button specific to Auth UI */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={onToggleTheme}
                    className={`p-3 rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-[#F0F4F9] text-[#1F1F1F] hover:bg-[#E0E2E5]' : 'bg-[#1E1F20] text-[#E3E3E3] hover:bg-[#28292A] border border-[#444746]'}`}
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon-star"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    )}
                </button>
            </div>

            <div className="text-center w-full mb-10">
                <h1 className={`text-5xl font-bold mb-4 tracking-tight ${theme === 'light' ? 'text-[#1F1F1F]' : 'text-[#E3E3E3]'}`}>
                    Flashcard <span className={theme === 'light' ? 'text-[#0B57D0]' : 'text-[#A8C7FA]'}>Generator</span>
                </h1>
                <p className={`text-xl font-light ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>
                    Supercharge your study sessions.
                </p>
            </div>

            <div className={`w-full max-w-md border-2 rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E0E2E5]' : 'bg-[#1E1F20] border-[#444746]'}`}>
                <div className={`flex justify-between mb-8 pb-4 border-b ${theme === 'light' ? 'border-[#E0E2E5]' : 'border-[#444746]'}`}>
                    <button
                        type="button"
                        className={`text-lg font-bold pb-2 border-b-2 transition-colors ${mode === 'login'
                            ? (theme === 'light' ? 'text-[#0B57D0] border-[#0B57D0]' : 'text-[#A8C7FA] border-[#A8C7FA]')
                            : (theme === 'light' ? 'text-[#444746] border-transparent hover:text-[#1F1F1F]' : 'text-[#C4C7C5] border-transparent hover:text-[#E3E3E3]')
                            }`}
                        onClick={() => { setMode('login'); setError(''); setMessage(''); setConfirmPassword(''); }}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className={`text-lg font-bold pb-2 border-b-2 transition-colors ${mode === 'signup'
                            ? (theme === 'light' ? 'text-[#0B57D0] border-[#0B57D0]' : 'text-[#A8C7FA] border-[#A8C7FA]')
                            : (theme === 'light' ? 'text-[#444746] border-transparent hover:text-[#1F1F1F]' : 'text-[#C4C7C5] border-transparent hover:text-[#E3E3E3]')
                            }`}
                        onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                    >
                        Sign Up
                    </button>
                </div>

                {(error || authError) && (
                    <div className={`mb-6 p-4 rounded-xl text-sm text-center border ${theme === 'light' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/50'}`}>
                        {error || authError}
                    </div>
                )}

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm text-center border ${theme === 'light' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-green-500/10 text-green-400 border-green-500/50'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-6">

                    {mode === 'signup' && (
                        <div className="flex flex-col">
                            <label className={`text-sm font-bold mb-2 ml-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className={`border rounded-xl p-4 focus:outline-none transition-colors ${theme === 'light' ? 'bg-white text-[#1F1F1F] border-[#E0E2E5] focus:border-[#0B57D0]' : 'bg-[#131314] text-[#E3E3E3] border-[#444746] focus:border-[#A8C7FA]'}`}
                                placeholder="Your Name"
                            />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className={`text-sm font-bold mb-2 ml-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            required
                            className={`border rounded-xl p-4 focus:outline-none transition-colors ${theme === 'light' ? 'bg-white text-[#1F1F1F] border-[#E0E2E5] focus:border-[#0B57D0]' : 'bg-[#131314] text-[#E3E3E3] border-[#444746] focus:border-[#A8C7FA]'}`}
                            placeholder="student@example.com"
                        />
                    </div>

                    <div className="flex flex-col relative">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-bold ml-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>Password</label>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                required
                                className={`w-full border rounded-xl p-4 pr-16 focus:outline-none transition-colors ${theme === 'light' ? 'bg-white text-[#1F1F1F] border-[#E0E2E5] focus:border-[#0B57D0]' : 'bg-[#131314] text-[#E3E3E3] border-[#444746] focus:border-[#A8C7FA]'}`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${theme === 'light' ? 'text-[#444746] hover:text-[#1F1F1F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'}`}
                                tabIndex="-1"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <>
                            <div className="flex flex-col relative mt-6">
                                <label className={`text-sm font-bold mb-2 ml-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    required
                                    className={`w-full border rounded-xl p-4 pr-16 focus:outline-none transition-colors ${theme === 'light' ? 'bg-white text-[#1F1F1F] border-[#E0E2E5] focus:border-[#0B57D0]' : 'bg-[#131314] text-[#E3E3E3] border-[#444746] focus:border-[#A8C7FA]'}`}
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Password Constraints List */}
                            <div className={`mt-4 mx-2 flex flex-col space-y-2 text-sm ${theme === 'light' ? 'text-[#444746]' : 'text-[#C4C7C5]'}`}>
                                <div className="flex items-center">
                                    {getRequirementIcon(hasValidEmail, email.length > 0)}
                                    <span className={email.length > 0 ? (hasValidEmail ? 'text-green-500' : 'text-red-500') : ''}>Valid email address</span>
                                </div>
                                <div className="flex items-center">
                                    {getRequirementIcon(hasMinLength, password.length > 0)}
                                    <span className={password.length > 0 ? (hasMinLength ? 'text-green-500' : 'text-red-500') : ''}>At least 6 characters</span>
                                </div>
                                <div className="flex items-center">
                                    {getRequirementIcon(hasNumber, password.length > 0)}
                                    <span className={password.length > 0 ? (hasNumber ? 'text-green-500' : 'text-red-500') : ''}>Contains a number</span>
                                </div>
                                <div className="flex items-center">
                                    {getRequirementIcon(hasUppercase, password.length > 0)}
                                    <span className={password.length > 0 ? (hasUppercase ? 'text-green-500' : 'text-red-500') : ''}>Contains an uppercase letter</span>
                                </div>
                                <div className="flex items-center">
                                    {getRequirementIcon(passwordsMatch, confirmPassword.length > 0)}
                                    <span className={confirmPassword.length > 0 ? (passwordsMatch ? 'text-green-500' : 'text-red-500') : ''}>Passwords match exactly</span>
                                </div>
                            </div>
                        </>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-4 w-full font-bold text-lg py-4 rounded-xl flex items-center justify-center transition-colors shadow-lg active:scale-[0.98] disabled:opacity-50 ${theme === 'light' ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]' : 'bg-[#A8C7FA] text-[#004A77] hover:bg-[#D3E3FD]'}`}
                    >
                        {loading ? 'Processing...' : (
                            mode === 'login' ? 'Log In' : 'Create Account'
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
