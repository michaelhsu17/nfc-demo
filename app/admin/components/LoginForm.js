'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faLock,
    faRightToBracket,
    faSpinner,
    faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export default function LoginForm({ onLoginSuccess }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rememberMe }),
            });

            const data = await res.json();

            if (data.success) {
                onLoginSuccess(data.data);
            } else {
                setError(data.error);
            }
        } catch {
            setError('登入失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">
                    <FontAwesomeIcon icon={faRightToBracket} className="login-title-icon" />
                    管理員登入
                </h1>

                {error && (
                    <div className="login-error">
                        <FontAwesomeIcon icon={faCircleExclamation} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label">
                            <FontAwesomeIcon icon={faUser} />
                            帳號
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="login-input"
                            placeholder="請輸入帳號"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">
                            <FontAwesomeIcon icon={faLock} />
                            密碼
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="login-input"
                            placeholder="請輸入密碼"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="login-remember">
                        <label className="login-checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="login-checkbox"
                            />
                            <span>
                                記住我
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                登入中...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faRightToBracket} />
                                登入
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
