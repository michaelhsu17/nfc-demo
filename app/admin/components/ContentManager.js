'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFolder,
    faImage,
    faVideo,
    faUpload,
    faSpinner,
    faTrash,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default function ContentManager({ userId, username, onClose }) {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadContentType, setUploadContentType] = useState('image');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const fetchContents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/contents`);
            const data = await res.json();
            if (data.success) {
                setContents(data.data);
            }
        } catch (err) {
            console.error('Error fetching contents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchContents();
        }
    }, [userId]);

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(''), 3000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showError(`檔案大小不能超過 4MB（當前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('content_type', uploadContentType);

            const res = await fetch(`/api/users/${userId}/contents`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                fetchContents();
            } else {
                showError(data.error);
            }
        } catch {
            showError('上傳失敗');
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
            const res = await fetch(`/api/users/${userId}/contents?contentId=${contentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchContents();
            } else {
                showError(data.error);
            }
        } catch {
            showError('刪除失敗');
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
                <h3>
                    <FontAwesomeIcon icon={faFolder} />
                    內容管理 - {username}
                </h3>

                <h5>
                    影片和圖片將做為這位主播 NFC 背景播放用
                </h5>

                {/* Error Message */}
                {error && (
                    <div className="admin-message error" style={{ marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

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
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>最大 4MB</span>
                </div>

                {/* Contents Grid */}
                {loading ? (
                    <p className="admin-loading">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        載入中...
                    </p>
                ) : contents.length === 0 ? (
                    <p className="admin-empty">尚無內容</p>
                ) : (
                    <div className="admin-contents-grid">
                        {contents.map((content) => (
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
                    <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
                        <FontAwesomeIcon icon={faXmark} />
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}
