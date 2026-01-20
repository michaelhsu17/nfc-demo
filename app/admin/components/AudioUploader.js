'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMusic,
    faUpload,
    faSpinner,
    faXmark,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default function AudioUploader({ onUploadComplete, onClose, currentUrl }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '');
    const fileInputRef = useRef(null);

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

            const res = await fetch('/api/upload/audio', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadedUrl(data.url);
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

    const handleConfirm = () => {
        if (uploadedUrl) {
            onUploadComplete(uploadedUrl);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <h3>
                    <FontAwesomeIcon icon={faMusic} />
                    上傳音檔
                </h3>

                {/* Error Message */}
                {error && (
                    <div className="admin-message error" style={{ marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {/* Current/Uploaded Audio */}
                {uploadedUrl && (
                    <div style={{ marginBottom: '16px' }}>
                        <label className="admin-label">
                            <FontAwesomeIcon icon={faMusic} />
                            音檔預覽
                        </label>
                        <audio controls style={{ width: '100%' }}>
                            <source src={uploadedUrl} />
                        </audio>
                    </div>
                )}

                {/* Upload Button */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="admin-btn admin-btn-primary"
                        disabled={uploading}
                        style={{ width: '100%' }}
                    >
                        {uploading ? (
                            <><FontAwesomeIcon icon={faSpinner} spin /> 上傳中...</>
                        ) : (
                            <><FontAwesomeIcon icon={faUpload} /> {uploadedUrl ? '重新上傳' : '選擇音檔'}</>
                        )}
                    </button>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
                        最大 4MB，支援 mp3、wav、ogg 等格式
                    </p>
                </div>

                {/* Actions */}
                <div className="admin-edit-buttons">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="admin-btn admin-btn-success"
                        disabled={!uploadedUrl}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        確認
                    </button>
                    <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
                        <FontAwesomeIcon icon={faXmark} />
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
}
