'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faPlus,
    faPen,
    faFloppyDisk,
    faXmark,
    faUser,
    faLock,
    faSpinner,
    faCircleCheck,
    faCircleExclamation,
    faShield,
    faBan,
    faRotate,
    faIdCard,
    faFolder,
    faCopy,
} from '@fortawesome/free-solid-svg-icons';
import ContentManager from './ContentManager';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormData, setAddFormData] = useState({ username: '', password: '', is_admin: false, open_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ username: '', password: '', is_admin: false, open_id: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [viewingContentsUserId, setViewingContentsUserId] = useState(null);
    const [resetPasswordModal, setResetPasswordModal] = useState(null); // { userId, username, newPassword }
    const [deactivateModal, setDeactivateModal] = useState(null); // { userId, username }

    // Generate random password (16 characters)
    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+~`}{[]:;?><,.-=';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Toggle add form and generate password
    const toggleAddForm = () => {
        if (!showAddForm) {
            setAddFormData({ username: '', password: generatePassword(), is_admin: false, open_id: '' });
        } else {
            setAddFormData({ username: '', password: '', is_admin: false, open_id: '' });
        }
        setShowAddForm(!showAddForm);
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addFormData),
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', '使用者（主播）建立成功！');
                setAddFormData({ username: '', password: '', is_admin: false, open_id: '' });
                setShowAddForm(false);
                fetchUsers();
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '建立失敗');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...editFormData };
            if (!updateData.password) delete updateData.password;

            const res = await fetch(`/api/users/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', '更新成功！');
                setEditingId(null);
                fetchUsers();
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '更新失敗');
        }
    };

    const handleEdit = (user) => {
        setEditFormData({ username: user.username, password: '', is_admin: user.is_admin, open_id: user.open_id || '' });
        setEditingId(user.id);
    };

    const openResetPasswordModal = (userId, username) => {
        const newPassword = generatePassword();
        setResetPasswordModal({ userId, username, newPassword });
    };

    const confirmResetPassword = async () => {
        if (!resetPasswordModal) return;

        const { userId, newPassword } = resetPasswordModal;
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', '密碼已重設成功');
                setResetPasswordModal(null);
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '重設密碼失敗');
        }
    };

    const openDeactivateModal = (userId, username) => {
        setDeactivateModal({ userId, username });
    };

    const confirmDeactivate = async () => {
        if (!deactivateModal) return;

        try {
            const res = await fetch(`/api/users/${deactivateModal.userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showMessage('success', '使用者（主播）已停用');
                setDeactivateModal(null);
                fetchUsers();
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '操作失敗');
        }
    };

    const viewingUser = users.find(u => u.id === viewingContentsUserId);

    return (
        <div className="admin-card">
            <h2 className="admin-card-title">
                <FontAwesomeIcon icon={faUsers} />
                使用者（主播）管理
            </h2>

            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    <FontAwesomeIcon
                        icon={message.type === 'success' ? faCircleCheck : faCircleExclamation}
                        style={{ marginRight: '10px' }}
                    />
                    {message.text}
                </div>
            )}

            {/* Add User Button */}
            <button
                type="button"
                onClick={toggleAddForm}
                className={`admin-btn ${showAddForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                style={{ marginBottom: '20px' }}
            >
                <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
                {showAddForm ? '取消' : '新增使用者（主播）'}
            </button>

            {/* Add Form */}
            {showAddForm && (
                <form onSubmit={handleAddSubmit} className="admin-add-form-content">
                    <div className="admin-form-group">
                        <label className="admin-label">
                            <FontAwesomeIcon icon={faUser} />
                            帳號
                        </label>
                        <input
                            type="text"
                            value={addFormData.username}
                            onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                            className="admin-input"
                            placeholder="輸入帳號"
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">
                            <FontAwesomeIcon icon={faLock} />
                            密碼（自動產生）
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={addFormData.password}
                                className="admin-input admin-input-readonly"
                                readOnly
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(addFormData.password);
                                    showMessage('success', '密碼已複製到剪貼簿');
                                }}
                                className="admin-btn admin-btn-info"
                                title="複製密碼"
                            >
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                        </div>
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">
                            <FontAwesomeIcon icon={faIdCard} />
                            Open ID
                        </label>
                        <input
                            type="text"
                            value={addFormData.open_id}
                            onChange={(e) => setAddFormData({ ...addFormData, open_id: e.target.value })}
                            className="admin-input"
                            placeholder="輸入 Open ID（選填）"
                        />
                    </div>
                    <div className="admin-checkbox-row">
                        <label className="admin-checkbox-label">
                            <input
                                type="checkbox"
                                checked={addFormData.is_admin}
                                onChange={(e) => setAddFormData({ ...addFormData, is_admin: e.target.checked })}
                            />
                            <FontAwesomeIcon icon={faShield} />
                            管理員權限
                        </label>
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary">
                        <FontAwesomeIcon icon={faPlus} />
                        新增使用者（主播）
                    </button>
                </form>
            )}

            {/* Users Table - hidden when add form is open */}
            {!showAddForm && (loading ? (
                <p className="admin-loading">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    載入中...
                </p>
            ) : users.length === 0 ? (
                <p className="admin-empty">尚無使用者（主播）</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th><FontAwesomeIcon icon={faUser} /> 帳號</th>
                            <th><FontAwesomeIcon icon={faIdCard} /> Open ID</th>
                            <th>角色</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="admin-table-row">
                                <td>{u.username}</td>
                                <td>{u.open_id || '-'}</td>
                                <td>
                                    <span className={`admin-badge ${u.is_admin ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                                        <FontAwesomeIcon icon={u.is_admin ? faShield : faUser} />
                                        {u.is_admin ? 'Admin' : '使用者（主播）'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`admin-badge ${u.is_deactivated ? 'admin-badge-deactivated' : 'admin-badge-active'}`}>
                                        {u.is_deactivated ? '已停用' : '啟用中'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button
                                            onClick={() => handleEdit(u)}
                                            className="admin-btn admin-btn-primary admin-btn-small"
                                            title="編輯"
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                            編輯
                                        </button>
                                        <button
                                            onClick={() => setViewingContentsUserId(u.id)}
                                            className="admin-btn admin-btn-info admin-btn-small"
                                            title="內容管理"
                                        >
                                            <FontAwesomeIcon icon={faFolder} />
                                            內容管理
                                        </button>
                                        <button
                                            onClick={() => openResetPasswordModal(u.id, u.username)}
                                            className="admin-btn admin-btn-warning admin-btn-small"
                                            title="重設密碼"
                                        >
                                            <FontAwesomeIcon icon={faRotate} />
                                            重設密碼
                                        </button>
                                        {!u.is_deactivated && (
                                            <button
                                                onClick={() => openDeactivateModal(u.id, u.username)}
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                title="停用"
                                            >
                                                <FontAwesomeIcon icon={faBan} />
                                                停用
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}

            {/* Edit Modal */}
            {editingId && (
                <div className="admin-modal-overlay" onClick={() => setEditingId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>編輯使用者（主播）</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    <FontAwesomeIcon icon={faUser} />
                                    帳號
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.username}
                                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                    className="admin-input"
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    <FontAwesomeIcon icon={faIdCard} />
                                    Open ID
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.open_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, open_id: e.target.value })}
                                    className="admin-input"
                                    placeholder="輸入 Open ID（選填）"
                                />
                            </div>
                            <div className="admin-checkbox-row">
                                <label className="admin-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.is_admin}
                                        onChange={(e) => setEditFormData({ ...editFormData, is_admin: e.target.checked })}
                                    />
                                    <FontAwesomeIcon icon={faShield} />
                                    管理員權限
                                </label>
                            </div>
                            <div className="admin-edit-buttons">
                                <button type="submit" className="admin-btn admin-btn-success">
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                    儲存
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="admin-btn admin-btn-secondary">
                                    <FontAwesomeIcon icon={faXmark} />
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Manager Modal */}
            {viewingContentsUserId && viewingUser && (
                <ContentManager
                    userId={viewingContentsUserId}
                    username={viewingUser.username}
                    onClose={() => setViewingContentsUserId(null)}
                />
            )}

            {/* Reset Password Modal */}
            {resetPasswordModal && (
                <div className="admin-modal-overlay" onClick={() => setResetPasswordModal(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <FontAwesomeIcon icon={faRotate} />
                            重設密碼
                        </h3>
                        <p style={{ marginBottom: '16px', color: '#475569' }}>
                            確定要重設 <strong>{resetPasswordModal.username}</strong> 的密碼嗎？
                        </p>
                        <div className="admin-form-group">
                            <label className="admin-label">
                                <FontAwesomeIcon icon={faLock} />
                                新密碼
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={resetPasswordModal.newPassword}
                                    className="admin-input admin-input-readonly"
                                    readOnly
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(resetPasswordModal.newPassword);
                                        showMessage('success', '新密碼已複製到剪貼簿');
                                    }}
                                    className="admin-btn admin-btn-info"
                                    title="複製密碼"
                                >
                                    <FontAwesomeIcon icon={faCopy} />
                                </button>
                            </div>
                        </div>
                        <div className="admin-edit-buttons">
                            <button
                                type="button"
                                onClick={confirmResetPassword}
                                className="admin-btn admin-btn-warning"
                            >
                                <FontAwesomeIcon icon={faRotate} />
                                確認重設
                            </button>
                            <button
                                type="button"
                                onClick={() => setResetPasswordModal(null)}
                                className="admin-btn admin-btn-secondary"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate Modal */}
            {deactivateModal && (
                <div className="admin-modal-overlay" onClick={() => setDeactivateModal(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <FontAwesomeIcon icon={faBan} />
                            停用使用者（主播）
                        </h3>
                        <p style={{ marginBottom: '20px', color: '#475569' }}>
                            確定要停用 <strong>{deactivateModal.username}</strong> 嗎？
                        </p>
                        <p style={{ marginBottom: '20px', color: '#dc2626', fontSize: '0.9rem' }}>
                            停用後該使用者（主播）將無法登入系統。
                        </p>
                        <div className="admin-edit-buttons">
                            <button
                                type="button"
                                onClick={confirmDeactivate}
                                className="admin-btn admin-btn-danger"
                            >
                                <FontAwesomeIcon icon={faBan} />
                                確認停用
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeactivateModal(null)}
                                className="admin-btn admin-btn-secondary"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
