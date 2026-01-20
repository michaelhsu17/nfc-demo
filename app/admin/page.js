'use client';

import { useState, useEffect, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faPlus,
    faList,
    faPen,
    faTrash,
    faFloppyDisk,
    faXmark,
    faMusic,
    faSpinner,
    faCircleCheck,
    faCircleExclamation,
    faRightFromBracket,
    faUser,
    faUsers,
    faUpload,
    faIdCard,
} from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import LoginForm from './components/LoginForm';
import UserManagement from './components/UserManagement';
import AudioUploader from './components/AudioUploader';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addFormData, setAddFormData] = useState({ nfc_id: '', audio_url: '', target_user_id: '', viewer_open_id: '', viewer_user_id: '' });
    const [editFormData, setEditFormData] = useState({ audio_url: '', viewer_open_id: '', viewer_user_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState('nfc'); // 'nfc' or 'users'
    const [showAudioUploader, setShowAudioUploader] = useState(null); // 'add' or 'edit' or null
    const [usersList, setUsersList] = useState([]); // For admin to select target user

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                setUser(data.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Generate random NFC ID (uppercase letters and numbers only)
    const generateNfcId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Toggle add form visibility
    const toggleAddForm = () => {
        if (!showAddForm) {
            // Generate new NFC ID when opening the form
            setAddFormData({ nfc_id: generateNfcId(), audio_url: '', target_user_id: user.userId, viewer_open_id: '', viewer_user_id: '' });
        } else {
            // Clear form when closing
            setAddFormData({ nfc_id: '', audio_url: '', target_user_id: user.userId, viewer_open_id: '', viewer_user_id: '' });
        }
        setShowAddForm(!showAddForm);
    };

    // Fetch all cards
    const fetchCards = async () => {
        try {
            const res = await fetch('/api/nfc-cards');
            const data = await res.json();
            if (data.success) {
                setCards(data.data);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users list (for admin to select target user)
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsersList(data.data.filter(u => !u.is_deactivated));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCards();
            if (user?.isAdmin) {
                fetchUsers();
            }
        }
    }, [isAuthenticated, user]);

    // Show message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // Handle add submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/nfc-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addFormData),
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', '新增成功！');
                setAddFormData({ nfc_id: '', audio_url: '', target_user_id: user.userId, viewer_open_id: '', viewer_user_id: '' });
                setShowAddForm(false);
                fetchCards();
            } else {
                showMessage('error', data.error);
            }
        } catch (error) {
            showMessage('error', '新增失敗');
        }
    };

    // Handle edit submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`/api/nfc-cards/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });

            const data = await res.json();

            if (data.success) {
                showMessage('success', '更新成功！');
                setEditFormData({ audio_url: '', viewer_open_id: '', viewer_user_id: '' });
                setEditingId(null);
                fetchCards();
            } else {
                showMessage('error', data.error);
            }
        } catch (error) {
            showMessage('error', '更新失敗');
        }
    };

    // Handle edit
    const handleEdit = (card) => {
        setEditFormData({
            audio_url: card.audio_url || '',
            viewer_open_id: card.viewer_open_id || '',
            viewer_user_id: card.viewer_user_id || ''
        });
        setEditingId(card.id);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('確定要刪除嗎？')) return;

        try {
            const res = await fetch(`/api/nfc-cards/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                showMessage('success', '刪除成功！');
                if (editingId === id) {
                    setEditingId(null);
                    setEditFormData({ nfc_id: '', audio_url: '' });
                }
                fetchCards();
            } else {
                showMessage('error', data.error);
            }
        } catch (error) {
            showMessage('error', '刪除失敗');
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditFormData({ nfc_id: '', audio_url: '' });
        setEditingId(null);
    };

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="admin-container">
                <div className="admin-loading-full">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                    <p>載入中...</p>
                </div>
            </div>
        );
    }

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="admin-container">
            {/* Header with logout button */}
            <div className="admin-header">
                <h1 className="admin-title">
                    <FontAwesomeIcon icon={faCreditCard} className="admin-title-icon" />
                    17 NFC
                </h1>
                <div className="admin-user-info">
                    <span className="admin-username">
                        {user?.username}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="admin-btn admin-btn-secondary admin-btn-small"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        登出
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    <FontAwesomeIcon
                        icon={message.type === 'success' ? faCircleCheck : faCircleExclamation}
                        style={{ marginRight: '10px' }}
                    />
                    {message.text}
                </div>
            )}

            {/* Tab Navigation - Admin Only */}
            {user?.isAdmin && (
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'nfc' ? 'admin-tab-active' : ''}`}
                        onClick={() => setActiveTab('nfc')}
                    >
                        <FontAwesomeIcon icon={faCreditCard} />
                        NFC 卡片
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'admin-tab-active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FontAwesomeIcon icon={faUsers} />
                        使用者（主播）管理
                    </button>
                </div>
            )}

            {/* NFC Cards Tab Content */}
            {(activeTab === 'nfc' || !user?.isAdmin) && (
                <>
                    {/* NFC Cards List */}
                    <div className="admin-card">
                        <h2 className="admin-card-title">
                            <FontAwesomeIcon icon={faList} />
                            NFC 卡片列表
                        </h2>

                        {/* Add Button - Admin Only */}
                        {user?.isAdmin && (
                            <button
                                type="button"
                                onClick={toggleAddForm}
                                className={`admin-btn ${showAddForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                                style={{ marginBottom: '20px' }}
                            >
                                <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
                                {showAddForm ? '取消新增' : '新增聲音'}
                            </button>
                        )}

                        {/* Collapsible Add Form - Admin Only */}
                        {user?.isAdmin && showAddForm && (
                            <form onSubmit={handleAddSubmit} className="admin-add-form-content">
                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        <FontAwesomeIcon icon={faCreditCard} />
                                        NFC ID（自動產生）
                                    </label>
                                    <input
                                        type="text"
                                        value={addFormData.nfc_id}
                                        className="admin-input admin-input-readonly"
                                        placeholder="自動產生的 NFC ID"
                                        readOnly
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        <FontAwesomeIcon icon={faMusic} />
                                        音檔
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={addFormData.audio_url}
                                            className="admin-input admin-input-readonly"
                                            placeholder="請上傳音檔"
                                            readOnly
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowAudioUploader('add')}
                                            className="admin-btn admin-btn-info"
                                        >
                                            <FontAwesomeIcon icon={faUpload} />
                                            上傳
                                        </button>
                                    </div>
                                </div>
                                {user?.isAdmin && (
                                    <div className="admin-form-group">
                                        <label className="admin-label">
                                            <FontAwesomeIcon icon={faUser} />
                                            指定主播
                                        </label>
                                        <select
                                            value={addFormData.target_user_id}
                                            onChange={(e) => setAddFormData({ ...addFormData, target_user_id: e.target.value })}
                                            className="admin-input"
                                        >
                                            {usersList.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.username} {u.open_id ? `(${u.open_id})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        <FontAwesomeIcon icon={faIdCard} />
                                        觀眾 Open ID
                                    </label>
                                    <input
                                        type="text"
                                        value={addFormData.viewer_open_id}
                                        onChange={(e) => setAddFormData({ ...addFormData, viewer_open_id: e.target.value })}
                                        className="admin-input"
                                        placeholder="輸入觀眾 Open ID"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        <FontAwesomeIcon icon={faUser} />
                                        觀眾 User ID
                                    </label>
                                    <input
                                        type="text"
                                        value={addFormData.viewer_user_id}
                                        onChange={(e) => setAddFormData({ ...addFormData, viewer_user_id: e.target.value })}
                                        className="admin-input"
                                        placeholder="輸入觀眾 User ID"
                                        required
                                    />
                                </div>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={!addFormData.viewer_open_id || !addFormData.viewer_user_id}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    新增聲音
                                </button>
                            </form>
                        )}

                        {/* Table - hidden when add form is open */}
                        {!showAddForm && (loading ? (
                            <p className="admin-loading">
                                <FontAwesomeIcon icon={faSpinner} spin />
                                載入中...
                            </p>
                        ) : cards.length === 0 ? (
                            <p className="admin-empty">尚無資料</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <FontAwesomeIcon icon={faCreditCard} />
                                            NFC ID
                                        </th>
                                        <th>
                                            <FontAwesomeIcon icon={faMusic} />
                                            Audio URL
                                        </th>
                                        <th>
                                            <FontAwesomeIcon icon={faIdCard} />
                                            觀眾 Open ID
                                        </th>
                                        {user?.isAdmin && <th><FontAwesomeIcon icon={faUser} /> 擁有者</th>}
                                        <th>建立時間</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cards.map((card, index) => (
                                        <Fragment key={card.id}>
                                            <tr
                                                className="admin-table-row"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <td>{card.nfc_id}</td>
                                                <td className="admin-url-cell">
                                                    {card.audio_url ? (
                                                        <a href={card.audio_url} target="_blank" rel="noopener noreferrer" className="admin-link">
                                                            <FontAwesomeIcon icon={faMusic} style={{ marginRight: '6px' }} />
                                                            {card.audio_url.split('/').pop()}
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ color: '#64748b' }}>
                                                        {card.viewer_open_id || '-'}
                                                    </span>
                                                </td>
                                                {user?.isAdmin && (
                                                    <td>
                                                        <span className="admin-owner-badge">
                                                            {card.owner_open_id || '未指定'}
                                                        </span>
                                                    </td>
                                                )}
                                                <td>
                                                    {new Date(card.created_at).toLocaleString('zh-TW')}
                                                </td>
                                                <td>
                                                    <div className="admin-actions">
                                                        {user?.isAdmin ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(card)}
                                                                    className="admin-btn admin-btn-primary admin-btn-small"
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                    編輯
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(card.id)}
                                                                    className="admin-btn admin-btn-danger admin-btn-small"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                    刪除
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(card.id);
                                                                    setShowAudioUploader('edit');
                                                                    setEditFormData({ nfc_id: card.nfc_id, audio_url: card.audio_url || '' });
                                                                }}
                                                                className="admin-btn admin-btn-info admin-btn-small"
                                                            >
                                                                <FontAwesomeIcon icon={faUpload} />
                                                                上傳音檔
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Inline Edit Form - Admin Only */}
                                            {user?.isAdmin && editingId === card.id && (
                                                <tr key={`edit-${card.id}`} className="admin-edit-row">
                                                    <td colSpan={user?.isAdmin ? 6 : 5}>
                                                        <form onSubmit={handleEditSubmit} className="admin-edit-form">
                                                            <div className="admin-edit-inputs">
                                                                <div className="admin-edit-group">
                                                                    <label className="admin-label">
                                                                        <FontAwesomeIcon icon={faIdCard} />
                                                                        觀眾 Open ID
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editFormData.viewer_open_id}
                                                                        onChange={(e) => setEditFormData({ ...editFormData, viewer_open_id: e.target.value })}
                                                                        className="admin-input"
                                                                        placeholder="輸入觀眾 Open ID"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="admin-edit-group">
                                                                    <label className="admin-label">
                                                                        <FontAwesomeIcon icon={faUser} />
                                                                        觀眾 User ID
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editFormData.viewer_user_id}
                                                                        onChange={(e) => setEditFormData({ ...editFormData, viewer_user_id: e.target.value })}
                                                                        className="admin-input"
                                                                        placeholder="輸入觀眾 User ID"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="admin-edit-group">
                                                                    <label className="admin-label">
                                                                        <FontAwesomeIcon icon={faMusic} />
                                                                        音檔
                                                                    </label>
                                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                        <input
                                                                            type="text"
                                                                            value={editFormData.audio_url}
                                                                            className="admin-input admin-input-readonly"
                                                                            placeholder="請上傳音檔（選填）"
                                                                            readOnly
                                                                            style={{ flex: 1 }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowAudioUploader('edit')}
                                                                            className="admin-btn admin-btn-info"
                                                                        >
                                                                            <FontAwesomeIcon icon={faUpload} />
                                                                            上傳
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="admin-edit-buttons">
                                                                <button type="submit" className="admin-btn admin-btn-success">
                                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                                    儲存
                                                                </button>
                                                                <button type="button" onClick={handleCancelEdit} className="admin-btn admin-btn-secondary">
                                                                    <FontAwesomeIcon icon={faXmark} />
                                                                    取消
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        ))}
                    </div>
                </>
            )}

            {/* User Management Tab - Admin Only */}
            {user?.isAdmin && activeTab === 'users' && <UserManagement />}

            {/* Audio Uploader Modal */}
            {showAudioUploader && (
                <AudioUploader
                    currentUrl={showAudioUploader === 'add' ? addFormData.audio_url : editFormData.audio_url}
                    onUploadComplete={(url) => {
                        if (showAudioUploader === 'add') {
                            setAddFormData({ ...addFormData, audio_url: url });
                        } else {
                            setEditFormData({ ...editFormData, audio_url: url });
                        }
                        setShowAudioUploader(null);
                    }}
                    onClose={() => setShowAudioUploader(null)}
                />
            )}
        </div>
    );
}
