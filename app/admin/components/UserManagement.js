'use client';

import { useState, useEffect, useRef } from 'react';
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
    faImage,
    faVideo,
    faTrash,
    faUpload,
    faFolder,
} from '@fortawesome/free-solid-svg-icons';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormData, setAddFormData] = useState({ username: '', password: '', is_admin: false, open_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ username: '', password: '', is_admin: false, open_id: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [viewingContentsUserId, setViewingContentsUserId] = useState(null);
    const [userContents, setUserContents] = useState([]);
    const [contentsLoading, setContentsLoading] = useState(false);
    const [uploadContentType, setUploadContentType] = useState('image');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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

    const fetchUserContents = async (userId) => {
        setContentsLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/contents`);
            const data = await res.json();
            if (data.success) {
                setUserContents(data.data);
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
        } finally {
            setContentsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (viewingContentsUserId) {
            fetchUserContents(viewingContentsUserId);
        }
    }, [viewingContentsUserId]);

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
                showMessage('success', '使用者建立成功！');
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

    const handleResetPassword = async (userId, username) => {
        const newPassword = generatePassword();
        if (!confirm(`確定要重設 ${username} 的密碼嗎？\n\n新密碼將是: ${newPassword}`)) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', `密碼已重設為: ${newPassword}`);
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '重設密碼失敗');
        }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('確定要停用此使用者嗎？')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showMessage('success', '使用者已停用');
                fetchUsers();
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '操作失敗');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('content_type', uploadContentType);

            const res = await fetch(`/api/users/${viewingContentsUserId}/contents`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                fetchUserContents(viewingContentsUserId);
                showMessage('success', '上傳成功');
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '上傳失敗');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteContent = async (contentId) => {
        if (!confirm('確定要刪除此內容嗎？')) return;

        try {
            const res = await fetch(`/api/users/${viewingContentsUserId}/contents?contentId=${contentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchUserContents(viewingContentsUserId);
                showMessage('success', '內容已刪除');
            } else {
                showMessage('error', data.error);
            }
        } catch {
            showMessage('error', '刪除失敗');
        }
    };

    return (
        <div className="admin-card">
            <h2 className="admin-card-title">
                <FontAwesomeIcon icon={faUsers} />
                使用者管理
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
                {showAddForm ? '取消' : '新增使用者'}
            </button>

            {/* Add Form */}
            {showAddForm && (
                <form onSubmit={handleAddSubmit} className="admin-add-form-content">
                    <div className="admin-edit-inputs">
                        <div className="admin-edit-group">
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
                        <div className="admin-edit-group">
                            <label className="admin-label">
                                <FontAwesomeIcon icon={faLock} />
                                密碼（自動產生）
                            </label>
                            <input
                                type="text"
                                value={addFormData.password}
                                className="admin-input admin-input-readonly"
                                readOnly
                            />
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
                        建立使用者
                    </button>
                </form>
            )}

            {/* Users Table */}
            {loading ? (
                <p className="admin-loading">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    載入中...
                </p>
            ) : users.length === 0 ? (
                <p className="admin-empty">尚無使用者</p>
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
                                        {u.is_admin ? 'Admin' : '使用者'}
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
                                        </button>
                                        <button
                                            onClick={() => setViewingContentsUserId(u.id)}
                                            className="admin-btn admin-btn-info admin-btn-small"
                                            title="內容管理"
                                        >
                                            <FontAwesomeIcon icon={faFolder} />
                                        </button>
                                        <button
                                            onClick={() => handleResetPassword(u.id, u.username)}
                                            className="admin-btn admin-btn-warning admin-btn-small"
                                            title="重設密碼"
                                        >
                                            <FontAwesomeIcon icon={faRotate} />
                                        </button>
                                        {!u.is_deactivated && (
                                            <button
                                                onClick={() => handleDeactivate(u.id)}
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                title="停用"
                                            >
                                                <FontAwesomeIcon icon={faBan} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Edit Modal */}
            {editingId && (
                <div className="admin-modal-overlay" onClick={() => setEditingId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>編輯使用者</h3>
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

            {/* Contents Modal */}
            {viewingContentsUserId && (
                <div className="admin-modal-overlay" onClick={() => setViewingContentsUserId(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <FontAwesomeIcon icon={faFolder} />
                            內容管理 - {users.find(u => u.id === viewingContentsUserId)?.username}
                        </h3>

                        {/* Upload Form */}
                        <div className="admin-upload-form">
                            <div className="admin-content-type-selector">
                                <button
                                    type="button"
                                    className={`admin-type-btn ${uploadContentType === 'image' ? 'active' : ''}`}
                                    onClick={() => setUploadContentType('image')}
                                >
                                    <FontAwesomeIcon icon={faImage} />
                                    圖片
                                </button>
                                <button
                                    type="button"
                                    className={`admin-type-btn ${uploadContentType === 'video' ? 'active' : ''}`}
                                    onClick={() => setUploadContentType('video')}
                                >
                                    <FontAwesomeIcon icon={faVideo} />
                                    影片
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={uploadContentType === 'image' ? 'image/*' : 'video/*'}
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="admin-btn admin-btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <><FontAwesomeIcon icon={faSpinner} spin /> 上傳中...</>
                                ) : (
                                    <><FontAwesomeIcon icon={faUpload} /> 上傳 {uploadContentType === 'image' ? '圖片' : '影片'}</>
                                )}
                            </button>
                        </div>

                        {/* Contents Grid */}
                        {contentsLoading ? (
                            <p className="admin-loading">
                                <FontAwesomeIcon icon={faSpinner} spin />
                                載入中...
                            </p>
                        ) : userContents.length === 0 ? (
                            <p className="admin-empty">尚無內容</p>
                        ) : (
                            <div className="admin-contents-grid">
                                {userContents.map((content) => (
                                    <div key={content.id} className="admin-content-item">
                                        {content.content_type === 'image' ? (
                                            <img src={content.content_url} alt="" />
                                        ) : (
                                            <video src={content.content_url} controls />
                                        )}
                                        <div className="admin-content-badge">
                                            <FontAwesomeIcon icon={content.content_type === 'image' ? faImage : faVideo} />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteContent(content.id)}
                                            className="admin-content-delete"
                                            title="刪除"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="admin-edit-buttons" style={{ marginTop: '20px' }}>
                            <button type="button" onClick={() => setViewingContentsUserId(null)} className="admin-btn admin-btn-secondary">
                                <FontAwesomeIcon icon={faXmark} />
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
