'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faPlus,
    faList,
    faPen,
    faTrash,
    faFloppyDisk,
    faXmark,
    faVideo,
    faSpinner,
    faCircleCheck,
    faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import './admin.css';

export default function AdminPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addFormData, setAddFormData] = useState({ nfc_id: '', video_url: '' });
    const [editFormData, setEditFormData] = useState({ nfc_id: '', video_url: '' });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

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

    useEffect(() => {
        fetchCards();
    }, []);

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
                setAddFormData({ nfc_id: '', video_url: '' });
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
                setEditFormData({ nfc_id: '', video_url: '' });
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
        setEditFormData({ nfc_id: card.nfc_id, video_url: card.video_url });
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
                    setEditFormData({ nfc_id: '', video_url: '' });
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
        setEditFormData({ nfc_id: '', video_url: '' });
        setEditingId(null);
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">
                <FontAwesomeIcon icon={faCreditCard} className="admin-title-icon" />
                17 NFC
            </h1>

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

            {/* Add Form */}
            <form onSubmit={handleAddSubmit} className="admin-card">
                <h2 className="admin-card-title">
                    <FontAwesomeIcon icon={faPlus} />
                    新增
                </h2>
                <div className="admin-form-group">
                    <label className="admin-label">
                        <FontAwesomeIcon icon={faCreditCard} />
                        NFC ID
                    </label>
                    <input
                        type="text"
                        value={addFormData.nfc_id}
                        onChange={(e) => setAddFormData({ ...addFormData, nfc_id: e.target.value })}
                        className="admin-input"
                        placeholder="輸入 NFC ID"
                        required
                    />
                </div>
                <div className="admin-form-group">
                    <label className="admin-label">
                        <FontAwesomeIcon icon={faVideo} />
                        Video URL
                    </label>
                    <input
                        type="url"
                        value={addFormData.video_url}
                        onChange={(e) => setAddFormData({ ...addFormData, video_url: e.target.value })}
                        className="admin-input"
                        placeholder="輸入影片網址"
                        required
                    />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                    <FontAwesomeIcon icon={faPlus} />
                    新增
                </button>
            </form>

            {/* Table */}
            <div className="admin-card">
                <h2 className="admin-card-title">
                    <FontAwesomeIcon icon={faList} />
                    列表
                </h2>
                {loading ? (
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
                                    <FontAwesomeIcon icon={faVideo} />
                                    Video URL
                                </th>
                                <th>建立時間</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card, index) => (
                                <>
                                    <tr
                                        key={card.id}
                                        className="admin-table-row"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <td>{card.nfc_id}</td>
                                        <td className="admin-url-cell">
                                            <a href={card.video_url} target="_blank" rel="noopener noreferrer" className="admin-link">
                                                {card.video_url}
                                            </a>
                                        </td>
                                        <td>
                                            {new Date(card.created_at).toLocaleString('zh-TW')}
                                        </td>
                                        <td>
                                            <div className="admin-actions">
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
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Inline Edit Form */}
                                    {editingId === card.id && (
                                        <tr key={`edit-${card.id}`} className="admin-edit-row">
                                            <td colSpan={4}>
                                                <form onSubmit={handleEditSubmit} className="admin-edit-form">
                                                    <div className="admin-edit-inputs">
                                                        <div className="admin-edit-group">
                                                            <label className="admin-label">
                                                                <FontAwesomeIcon icon={faCreditCard} />
                                                                NFC ID
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.nfc_id}
                                                                onChange={(e) => setEditFormData({ ...editFormData, nfc_id: e.target.value })}
                                                                className="admin-input"
                                                                placeholder="輸入 NFC ID"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="admin-edit-group">
                                                            <label className="admin-label">
                                                                <FontAwesomeIcon icon={faVideo} />
                                                                Video URL
                                                            </label>
                                                            <input
                                                                type="url"
                                                                value={editFormData.video_url}
                                                                onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value })}
                                                                className="admin-input"
                                                                placeholder="輸入影片網址"
                                                                required
                                                            />
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
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
