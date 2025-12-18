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
        <div style={styles.container}>
            <h1 style={styles.title}>
                <FontAwesomeIcon icon={faCreditCard} style={styles.titleIcon} />
                NFC 管理
            </h1>

            {/* Message */}
            {message.text && (
                <div style={{
                    ...styles.message,
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                }}>
                    <FontAwesomeIcon
                        icon={message.type === 'success' ? faCircleCheck : faCircleExclamation}
                        style={{ marginRight: '8px' }}
                    />
                    {message.text}
                </div>
            )}

            {/* Add Form */}
            <form onSubmit={handleAddSubmit} style={styles.form}>
                <h2 style={styles.formTitle}>
                    <FontAwesomeIcon icon={faPlus} style={styles.sectionIcon} />
                    新增
                </h2>
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FontAwesomeIcon icon={faCreditCard} style={styles.labelIcon} />
                        NFC ID
                    </label>
                    <input
                        type="text"
                        value={addFormData.nfc_id}
                        onChange={(e) => setAddFormData({ ...addFormData, nfc_id: e.target.value })}
                        style={styles.input}
                        placeholder="輸入 NFC ID"
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FontAwesomeIcon icon={faVideo} style={styles.labelIcon} />
                        Video URL
                    </label>
                    <input
                        type="url"
                        value={addFormData.video_url}
                        onChange={(e) => setAddFormData({ ...addFormData, video_url: e.target.value })}
                        style={styles.input}
                        placeholder="輸入影片網址"
                        required
                    />
                </div>
                <button type="submit" style={styles.submitButton}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                    新增
                </button>
            </form>

            {/* Table */}
            <div style={styles.tableContainer}>
                <h2 style={styles.tableTitle}>
                    <FontAwesomeIcon icon={faList} style={styles.sectionIcon} />
                    列表
                </h2>
                {loading ? (
                    <p style={styles.loadingText}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                        載入中...
                    </p>
                ) : cards.length === 0 ? (
                    <p style={styles.emptyText}>尚無資料</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    <FontAwesomeIcon icon={faCreditCard} style={styles.thIcon} />
                                    NFC ID
                                </th>
                                <th style={styles.th}>
                                    <FontAwesomeIcon icon={faVideo} style={styles.thIcon} />
                                    Video URL
                                </th>
                                <th style={styles.th}>建立時間</th>
                                <th style={styles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card) => (
                                <>
                                    <tr key={card.id} style={styles.tr}>
                                        <td style={styles.td}>{card.nfc_id}</td>
                                        <td style={styles.tdUrl}>
                                            <a href={card.video_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                                {card.video_url}
                                            </a>
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(card.created_at).toLocaleString('zh-TW')}
                                        </td>
                                        <td style={styles.td}>
                                            <button onClick={() => handleEdit(card)} style={styles.editButton}>
                                                <FontAwesomeIcon icon={faPen} style={{ marginRight: '6px' }} />
                                                編輯
                                            </button>
                                            <button onClick={() => handleDelete(card.id)} style={styles.deleteButton}>
                                                <FontAwesomeIcon icon={faTrash} style={{ marginRight: '6px' }} />
                                                刪除
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Inline Edit Form */}
                                    {editingId === card.id && (
                                        <tr key={`edit-${card.id}`} style={styles.editRow}>
                                            <td colSpan={4} style={styles.editCell}>
                                                <form onSubmit={handleEditSubmit} style={styles.inlineForm}>
                                                    <div style={styles.inlineFormInputs}>
                                                        <div style={styles.inlineFormGroup}>
                                                            <label style={styles.inlineLabel}>
                                                                <FontAwesomeIcon icon={faCreditCard} style={styles.labelIcon} />
                                                                NFC ID
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.nfc_id}
                                                                onChange={(e) => setEditFormData({ ...editFormData, nfc_id: e.target.value })}
                                                                style={styles.inlineInput}
                                                                placeholder="輸入 NFC ID"
                                                                required
                                                            />
                                                        </div>
                                                        <div style={styles.inlineFormGroup}>
                                                            <label style={styles.inlineLabel}>
                                                                <FontAwesomeIcon icon={faVideo} style={styles.labelIcon} />
                                                                Video URL
                                                            </label>
                                                            <input
                                                                type="url"
                                                                value={editFormData.video_url}
                                                                onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value })}
                                                                style={styles.inlineInput}
                                                                placeholder="輸入影片網址"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={styles.inlineButtonGroup}>
                                                        <button type="submit" style={styles.saveButton}>
                                                            <FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: '6px' }} />
                                                            儲存
                                                        </button>
                                                        <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                                                            <FontAwesomeIcon icon={faXmark} style={{ marginRight: '6px' }} />
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

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: '30px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
    },
    titleIcon: {
        color: '#4f46e5',
    },
    message: {
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '40px',
    },
    formTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    sectionIcon: {
        color: '#4f46e5',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#555',
        marginBottom: '8px',
    },
    labelIcon: {
        color: '#888',
        fontSize: '0.85rem',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '1rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        transition: 'border-color 0.2s',
        outline: 'none',
        boxSizing: 'border-box',
    },
    submitButton: {
        padding: '12px 32px',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#4f46e5',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    tableTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '14px 16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #e0e0e0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#555',
    },
    thIcon: {
        marginRight: '8px',
        color: '#888',
    },
    tr: {
        borderBottom: '1px solid #e0e0e0',
    },
    td: {
        padding: '14px 16px',
        fontSize: '0.95rem',
        color: '#333',
    },
    tdUrl: {
        padding: '14px 16px',
        fontSize: '0.95rem',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    link: {
        color: '#4f46e5',
        textDecoration: 'none',
    },
    editButton: {
        padding: '6px 16px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#4f46e5',
        backgroundColor: '#eef2ff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        display: 'inline-flex',
        alignItems: 'center',
    },
    deleteButton: {
        padding: '6px 16px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        padding: '40px 0',
    },
    loadingText: {
        textAlign: 'center',
        color: '#888',
        padding: '40px 0',
    },
    // Inline edit styles
    editRow: {
        backgroundColor: '#f0f4ff',
    },
    editCell: {
        padding: '20px 16px',
    },
    inlineForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inlineFormInputs: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
    },
    inlineFormGroup: {
        flex: '1',
        minWidth: '250px',
    },
    inlineLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#555',
        marginBottom: '6px',
    },
    inlineInput: {
        width: '100%',
        padding: '10px 14px',
        fontSize: '0.95rem',
        border: '2px solid #c7d2fe',
        borderRadius: '6px',
        outline: 'none',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
    },
    inlineButtonGroup: {
        display: 'flex',
        gap: '10px',
    },
    saveButton: {
        padding: '10px 24px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#22c55e',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
    },
    cancelButton: {
        padding: '10px 24px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#666',
        backgroundColor: '#e5e5e5',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
    },
};
