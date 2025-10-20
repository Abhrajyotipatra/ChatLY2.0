import { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";
import ReactMarkdown from 'react-markdown';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import './App.css';

function ChatApp() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('chatly-theme');
        return savedTheme === 'dark';
    });
    
    // Auth states
    const { user, login, logout, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    
    const messagesEndRef = useRef(null);

    // Show auth modal if user is not logged in
    useEffect(() => {
        if (!loading && !user) {
            setAuthMode('login');
            setShowAuthModal(true);
        }
    }, [loading, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        localStorage.setItem('chatly-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        if (user) {
            let socketInstance = io("http://localhost:3000");
            setSocket(socketInstance);

            socketInstance.on('ai-message-response', (response) => {
                const botMessage = {
                    id: Date.now() + 1,
                    text: response,
                    timestamp: new Date(),
                    sender: 'bot',
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
                setIsTyping(false);
            });

            return () => socketInstance.disconnect();
        }
    }, [user]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleSendMessage = () => {
        if (!user) {
            alert('Please login to use the chatbot!');
            return;
        }
        
        if (inputMessage.trim() && socket) {
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    id: Date.now(),
                    text: inputMessage,
                    sender: 'user',
                    timestamp: new Date(),
                },
            ]);
            socket.emit("ai-message", inputMessage);
            setInputMessage('');
            setIsTyping(true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleAuthSuccess = (userData) => {
        login(userData);
        setShowAuthModal(false);
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'GET',
                credentials: 'include'
            });
            logout();
            setMessages([]); // Clear messages on logout
            // Reopen auth modal after logout
            setAuthMode('login');
            setShowAuthModal(true);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleModalClose = () => {
        // Only allow closing if user is logged in
        if (user) {
            setShowAuthModal(false);
        }
    };

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // If no user, show only auth modal (no chat interface)
    if (!user) {
        return (
            <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={handleModalClose}
                    mode={authMode}
                    onSuccess={handleAuthSuccess}
                />
            </div>
        );
    }

    // User is logged in - show chat interface
    return (
        <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <div className="header-content">
                        <div className="chat-title">
                            <h2>🤖 ChatLY</h2>
                            <span className="online-status">● Online</span>
                        </div>
                        
                        <div className="header-actions">
                            {/* Theme Toggle */}
                            <button 
                                className="theme-toggle" 
                                onClick={toggleDarkMode}
                                aria-label="Toggle theme"
                            >
                                <div className={`toggle-icon ${darkMode ? 'dark' : 'light'}`}>
                                    <span className="sun-icon">☀️</span>
                                    <span className="moon-icon">🌙</span>
                                </div>
                            </button>

                            {/* User Info & Logout */}
                            <div className="auth-buttons">
                                <span className="user-greeting">Hi, {user.username}!</span>
                                <button 
                                    className="btn-login" 
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="welcome-message">
                            <div className="welcome-content">
                                <h3>👋 Welcome {user.username}!</h3>
                                <p>Start a conversation by typing a message below.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`message-wrapper ${message.sender}`}>
                                <div className="message-content">
                                    <div className="message-avatar">
                                        {message.sender === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="message-bubble">
                                        <div className="message-text">
                                            {message.sender === 'bot' ? (
                                                <ReactMarkdown>{message.text}</ReactMarkdown>
                                            ) : (
                                                message.text
                                            )}
                                        </div>
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isTyping && (
                        <div className="message-wrapper bot">
                            <div className="message-content">
                                <div className="message-avatar">🤖</div>
                                <div className="message-bubble">
                                    <div className="typing-dots">
                                        <span>●</span><span>●</span><span>●</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                    <div className="chat-input">
                        <textarea
                            className="message-input"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            rows={1}
                        />
                        <button
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                        >
                            ➤
                        </button>
                    </div>
                    <div className="input-footer">
                        <p>Press Enter to send, Shift + Enter for new line</p>
                    </div>
                </div>
            </div>

            {/* Auth Modal (for switching between login/register) */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={handleModalClose}
                mode={authMode}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}

// Wrap with AuthProvider
function App() {
    return (
        <AuthProvider>
            <ChatApp />
        </AuthProvider>
    );
}

export default App;
