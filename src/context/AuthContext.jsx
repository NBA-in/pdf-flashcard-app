import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        // 1. Listen for standard Auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // 2. Check if the user is returning from a passwordless email link
        const checkEmailLink = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                // If the email isn't in local storage (e.g. opened on a different device), ask for it.
                if (!email) {
                    email = window.prompt('Please provide your email for confirmation');
                }

                try {
                    if (email) {
                        await signInWithEmailLink(auth, email, window.location.href);
                        window.localStorage.removeItem('emailForSignIn');
                        // Clean up the URL so the token isn't sitting in the address bar
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch (error) {
                    console.error("Error signing in with email link", error);
                    setAuthError(error.message);
                }
            }
        };

        checkEmailLink();

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        authError,
        setAuthError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
