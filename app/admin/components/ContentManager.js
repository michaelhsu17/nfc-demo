'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFolder,
    faVideo,
    faUpload,
    faSpinner,
    faTrash,
    faXmark,
    faFaceSmile,
    faFaceAngry,
    faFaceSadTear,
    faFaceLaughBeam,
} from '@fortawesome/free-solid-svg-icons';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const EMOTIONS = [
    { key: 'happy', label: '喜', icon: faFaceSmile, color: '#fbbf24' },
    { key: 'angry', label: '怒', icon: faFaceAngry, color: '#ef4444' },
    { key: 'sad', label: '哀', icon: faFaceSadTear, color: '#3b82f6' },
    { key: 'joy', label: '樂', icon: faFaceLaughBeam, color: '#22c55e' },
];

export default function ContentManager({ userId, username, onClose }) {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingEmotion, setUploadingEmotion] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const currentEmotionRef = useRef(null);

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

    const getContentForEmotion = (emotion) => {
        return contents.find((c) => c.emotion === emotion);
    };

    const handleUploadClick = (emotion) => {
        currentEmotionRef.current = emotion;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !currentEmotionRef.current) return;

        const emotion = currentEmotionRef.current;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showError(`檔案大小不能超過 4MB（當前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setUploadingEmotion(emotion);
        setError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('content_type', 'video');
            formData.append('emotion', emotion);

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
            setUploadingEmotion(null);
            currentEmotionRef.current = null;
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
                    每個情緒可上傳一個影片，作為 NFC 背景播放用（最大 4MB）
                </h5>

                {/* Error Message */}
                {error && (
                    <div className="admin-message error" style={{ marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />

                {/* Emotion Slots Grid */}
                {loading ? (
                    <p className="admin-loading">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        載入中...
                    </p>
                ) : (
                    <div className="admin-emotion-grid">
                        {EMOTIONS.map((emotion) => {
                            const content = getContentForEmotion(emotion.key);
                            const isUploading = uploadingEmotion === emotion.key;

                            return (
                                <div key={emotion.key} className="admin-emotion-card">
                                    <div className="admin-emotion-header" style={{ borderColor: emotion.color }}>
                                        <FontAwesomeIcon icon={emotion.icon} style={{ color: emotion.color, fontSize: '1.5rem' }} />
                                        <span className="admin-emotion-label">{emotion.label}</span>
                                    </div>

                                    <div className="admin-emotion-content">
                                        {content ? (
                                            <>
                                                <video src={content.content_url} controls />
                                                <div className="admin-emotion-actions">
                                                    <button
                                                        onClick={() => handleUploadClick(emotion.key)}
                                                        className="admin-btn admin-btn-info admin-btn-small"
                                                        disabled={isUploading}
                                                    >
                                                        {isUploading ? (
                                                            <FontAwesomeIcon icon={faSpinner} spin />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faUpload} />
                                                        )}
                                                        替換
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContent(content.id)}
                                                        className="admin-btn admin-btn-danger admin-btn-small"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        刪除
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="admin-emotion-empty">
                                                <button
                                                    onClick={() => handleUploadClick(emotion.key)}
                                                    className="admin-btn admin-btn-primary"
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? (
                                                        <><FontAwesomeIcon icon={faSpinner} spin /> 上傳中...</>
                                                    ) : (
                                                        <><FontAwesomeIcon icon={faUpload} /> 上傳影片</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
