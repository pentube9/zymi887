import { useState } from 'react';
import './AvatarUploader.css';

function AvatarUploader({ userId, currentAvatar, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size on client side too
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, WebP allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Max 2MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('zymi_token');
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onAvatarUpdate?.(data.avatar);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const token = localStorage.getItem('zymi_token');
      const res = await fetch('/api/upload/avatar', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPreview(null);
        onAvatarUpdate?.(null);
      }
    } catch (err) {
      setError('Failed to remove avatar');
    }
  };

  return (
    <div className="avatar-uploader">
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Avatar preview" />
        ) : currentAvatar ? (
          <img src={currentAvatar} alt="Current avatar" />
        ) : (
          <div className="avatar-placeholder">
            {userId?.toString().charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <div className="avatar-actions">
        <label className="avatar-upload-btn">
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {currentAvatar && (
          <button className="avatar-remove-btn" onClick={handleRemove}>
            Remove
          </button>
        )}
      </div>
      {error && <div className="avatar-error">{error}</div>}
      <div className="avatar-hint">Max 2MB, JPG/PNG/WebP</div>
    </div>
  );
}

export default AvatarUploader;
