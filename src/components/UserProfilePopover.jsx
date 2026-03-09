import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { updateProfile, updatePassword, deleteUser, signOut } from 'firebase/auth';

const UserProfilePopover = ({ theme, currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('main'); // 'main', 'rename', 'password', 'delete', 'deleted_success'

    // States for sub-menus
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteEmailMatch, setDeleteEmailMatch] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [countdown, setCountdown] = useState(3);

    const popoverRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
                setTimeout(() => {
                    setActiveMenu('main');
                    setError('');
                    setSuccess('');
                }, 200); // Reset after closing animation
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        signOut(auth);
    };

    const handleChangeName = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setLoading(true);
        setError('');
        try {
            await updateProfile(currentUser, { displayName: newName });
            setSuccess('Name updated successfully!');
            setTimeout(() => {
                setSuccess('');
                setActiveMenu('main');
                setNewName('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updatePassword(currentUser, newPassword);
            setSuccess('Password updated successfully!');
            setTimeout(() => {
                setSuccess('');
                setActiveMenu('main');
                setNewPassword('');
            }, 2000);
        } catch (err) {
            // Often fails if login is not recent
            if (err.code === 'auth/requires-recent-login') {
                setError('Please sign out and sign back in to change your password.');
            } else {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await deleteUser(currentUser);
            setActiveMenu('deleted_success');

            // Start countdown
            let count = 3;
            setCountdown(count);
            const interval = setInterval(() => {
                count -= 1;
                setCountdown(count);
                if (count <= 0) {
                    clearInterval(interval);
                    // Firebase auth state listener will handle the redirect automatically once user is null
                }
            }, 1000);

        } catch (err) {
            if (err.code === 'auth/requires-recent-login') {
                setError('For security, please sign out and sign back in before deleting your account.');
            } else {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    const getInitial = () => {
        if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase();
        if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
        return 'U';
    };

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

    // Theming classes
    const isLight = theme === 'light';
    const menuBg = isLight ? 'bg-white border-[#E0E2E5]' : 'bg-[#1E1F20] border-[#444746]';
    const textColor = isLight ? 'text-[#1F1F1F]' : 'text-[#E3E3E3]';
    const mutedText = isLight ? 'text-[#444746]' : 'text-[#C4C7C5]';
    const hoverBg = isLight ? 'hover:bg-[#F0F4F9]' : 'hover:bg-[#28292A]';
    const inputBg = isLight ? 'bg-white border-[#E0E2E5] focus:border-[#0B57D0] text-[#1F1F1F]' : 'bg-[#131314] border-[#444746] focus:border-[#A8C7FA] text-[#E3E3E3]';

    return (
        <div className="relative" ref={popoverRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-3 px-2 py-3 rounded-xl w-full transition-colors ${hoverBg}`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isLight ? 'bg-[#0B57D0] text-white' : 'bg-[#A8C7FA] text-[#004A77]'}`}>
                    {getInitial()}
                </div>
                <div className="flex flex-col items-start truncate overflow-hidden">
                    <span className={`text-sm font-medium ${textColor} truncate max-w-[150px]`}>{displayName}</span>
                </div>
            </button>

            {/* Popover Menu */}
            {isOpen && (
                <div className={`absolute bottom-full left-0 mb-2 w-72 rounded-2xl shadow-xl border overflow-hidden z-50 ${menuBg}`}>

                    {/* Main Menu */}
                    {activeMenu === 'main' && (
                        <div className="flex flex-col py-2">
                            <div className={`px-4 py-3 border-b ${isLight ? 'border-[#E0E2E5]' : 'border-[#444746]'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>Signed in as</p>
                                <p className={`text-sm font-medium ${textColor} truncate`}>{currentUser?.email}</p>
                            </div>

                            <button onClick={() => { setActiveMenu('rename'); setError(''); }} className={`px-4 py-3 text-left text-sm font-medium ${textColor} ${hoverBg}`}>
                                Change Username
                            </button>
                            <button onClick={() => { setActiveMenu('password'); setError(''); }} className={`px-4 py-3 text-left text-sm font-medium ${textColor} ${hoverBg}`}>
                                Change Password
                            </button>

                            <div className={`h-px my-1 ${isLight ? 'bg-[#E0E2E5]' : 'bg-[#444746]'}`}></div>

                            <button onClick={() => { setActiveMenu('delete'); setError(''); }} className={`px-4 py-3 text-left text-sm font-medium text-red-500 ${isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'}`}>
                                Delete Account
                            </button>

                            <div className={`h-px my-1 ${isLight ? 'bg-[#E0E2E5]' : 'bg-[#444746]'}`}></div>

                            <button onClick={handleSignOut} className={`px-4 py-3 text-left text-sm font-medium ${textColor} ${hoverBg}`}>
                                Sign Out
                            </button>
                        </div>
                    )}

                    {/* Change Username Menu */}
                    {activeMenu === 'rename' && (
                        <form onSubmit={handleChangeName} className="p-4">
                            <h3 className={`font-bold mb-4 ${textColor}`}>Change Username</h3>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="New Username"
                                required
                                className={`w-full p-2 border rounded-lg mb-4 focus:outline-none ${inputBg}`}
                            />
                            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                            {success && <p className="text-green-500 text-xs mb-4">{success}</p>}
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => setActiveMenu('main')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${mutedText} ${hoverBg}`}>Cancel</button>
                                <button type="submit" disabled={loading} className={`flex-1 py-2 text-sm font-bold rounded-lg ${isLight ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]' : 'bg-[#A8C7FA] text-[#004A77] hover:bg-[#D3E3FD]'}`}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Change Password Menu */}
                    {activeMenu === 'password' && (
                        <form onSubmit={handleChangePassword} className="p-4">
                            <h3 className={`font-bold mb-4 ${textColor}`}>Change Password</h3>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                                className={`w-full p-2 border rounded-lg mb-4 focus:outline-none ${inputBg}`}
                            />
                            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                            {success && <p className="text-green-500 text-xs mb-4">{success}</p>}
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => setActiveMenu('main')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${mutedText} ${hoverBg}`}>Cancel</button>
                                <button type="submit" disabled={loading} className={`flex-1 py-2 text-sm font-bold rounded-lg ${isLight ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]' : 'bg-[#A8C7FA] text-[#004A77] hover:bg-[#D3E3FD]'}`}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Delete Account Menu */}
                    {activeMenu === 'delete' && (
                        <div className="p-4">
                            <h3 className="font-bold mb-2 text-red-500">Delete Account</h3>
                            <p className={`text-xs mb-4 ${mutedText}`}>
                                Warning: Deleting your account will cause <strong>permanent loss</strong> of this account and all your flashcards.
                            </p>
                            <p className={`text-xs mb-2 font-bold ${textColor}`}>To confirm, type your email:</p>
                            <p className={`text-xs mb-4 italic ${mutedText}`}>{currentUser?.email}</p>

                            <input
                                type="text"
                                value={deleteEmailMatch}
                                onChange={(e) => setDeleteEmailMatch(e.target.value)}
                                placeholder="Confirm Email"
                                className={`w-full p-2 border rounded-lg mb-4 focus:outline-none ${inputBg}`}
                            />

                            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                            <div className="flex space-x-2">
                                <button onClick={() => { setActiveMenu('main'); setDeleteEmailMatch(''); }} className={`flex-1 py-2 text-sm font-medium rounded-lg ${mutedText} ${hoverBg}`}>Cancel</button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading || deleteEmailMatch !== currentUser?.email}
                                    className="flex-1 py-2 text-sm font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Deleted Success Message */}
                    {activeMenu === 'deleted_success' && (
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                            <h3 className={`font-bold mb-2 ${textColor}`}>Account Deleted Successfully</h3>
                            <p className={`text-sm ${mutedText}`}>Redirecting to sign in page in {countdown}...</p>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default UserProfilePopover;
