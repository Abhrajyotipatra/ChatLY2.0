import { useState } from 'react';
import './AuthModal.css';


const AuthModal = ({ isOpen, onClose, mode, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentMode, setCurrentMode] = useState(mode);


    if (!isOpen) return null;


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');


        try {
            // Use environment variable for backend URL
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // TEMPORARY DEBUG - Remove after testing
              console.log('🔍 API_URL:', API_URL);
              console.log('🔍 import.meta.env:', import.meta.env);
            
            const endpoint = currentMode === 'login' 
                ? `${API_URL}/api/auth/login`
                : `${API_URL}/api/auth/register`;
              
                 console.log('🔍 Full endpoint:', endpoint);  // test purpose to debug

            const body = currentMode === 'login'
                ? { email: formData.email, password: formData.password }
                : formData;


            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });


            const data = await response.json();


            if (!response.ok) {
                throw new Error(data.message || data.errors?.[0]?.msg || 'Something went wrong');
            }


            // Success
            onSuccess(data.user);
            setFormData({ username: '', email: '', password: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const toggleMode = () => {
        setCurrentMode(currentMode === 'login' ? 'register' : 'login');
        setError('');
        setFormData({ username: '', email: '', password: '' });
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{currentMode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
                <p className="modal-subtitle">
                    {currentMode === 'login' 
                        ? 'Login to continue chatting with ChatLY AI' 
                        : 'Register to start chatting with ChatLY AI'}
                </p>


                <form onSubmit={handleSubmit}>
                    {currentMode === 'register' && (
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                required
                                minLength={3}
                            />
                        </div>
                    )}


                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            minLength={6}
                        />
                    </div>


                    {error && <div className="error-message">{error}</div>}


                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Please wait...' : currentMode === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>


                <div className="modal-footer">
                    <p>
                        {currentMode === 'login' 
                            ? "Don't have an account? " 
                            : "Already have an account? "}
                        <button 
                            type="button" 
                            className="toggle-mode-btn" 
                            onClick={toggleMode}
                        >
                            {currentMode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};


export default AuthModal;
