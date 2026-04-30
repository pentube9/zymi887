import React from 'react';
import './PremiumMediaRenderer.css';

const PremiumMediaRenderer = ({ message, onMediaClick }) => {
  if (!message) return null;

  // Defensive guards
  const messageType = message.message_type || message.type || 'text';
  const fileUrl = message.file_url || message.url || message.content || '';
  const fileName = message.file_name || message.name || 'Attachment';
  const metadata = message.metadata || {};

  function safeParseMediaData(rawData) {
    if (!rawData) return null;
    if (typeof rawData === 'object') return rawData;
    if (typeof rawData !== 'string') return null;

    const trimmed = rawData.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { label: trimmed };
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      console.warn('[PremiumMediaRenderer] Invalid media JSON:', error.message, rawData);
      return { label: rawData };
    }
  }

  if (messageType === 'image') {
    return (
      <div className="zy-media-image" onClick={() => onMediaClick?.(message)}>
        <img src={fileUrl} alt="Shared" loading="lazy" />
        <div className="zy-media-overlay" />
      </div>
    );
  }

  if (messageType === 'video') {
    return (
      <div className="zy-media-video" onClick={() => onMediaClick?.(message)}>
        <video src={fileUrl} />
        <div className="zy-video-play-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="zy-video-duration">{metadata?.duration || '0:00'}</div>
      </div>
    );
  }

  if (messageType === 'file' || messageType === 'document') {
    const displayFileName = fileName === 'Attachment' && typeof fileUrl === 'string' ? fileUrl.split('/').pop() : fileName;
    const fileSize = metadata?.size ? `${(metadata.size / 1024 / 1024).toFixed(1)} MB` : '';
    const fileExt = displayFileName.split('.').pop().toUpperCase();

    return (
      <div className="zy-media-document" onClick={() => window.open(fileUrl, '_blank')}>
        <div className="zy-doc-icon-box">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M13 2v7h7" />
          </svg>
          <span className="zy-doc-ext">{fileExt}</span>
        </div>
        <div className="zy-doc-details">
          <span className="zy-doc-name">{displayFileName}</span>
          <span className="zy-doc-meta">{fileExt} • {fileSize}</span>
        </div>
        <div className="zy-doc-download">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </div>
      </div>
    );
  }

  if (messageType === 'location') {
    const parsed = safeParseMediaData(message.content);
    const lat = message.location_lat || parsed?.lat || parsed?.latitude || parsed?.location_lat;
    const lng = message.location_lng || parsed?.lng || parsed?.longitude || parsed?.location_lng;

    if (!lat || !lng) {
      return (
        <div className="zy-media-location fallback">
          <div className="zy-location-info">
            <span className="zy-location-name">📍 Shared Location</span>
            <span className="zy-location-address">Location data unavailable</span>
          </div>
        </div>
      );
    }

    return (
      <div className="zy-media-location" onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')}>
        <div className="zy-location-map-preview">
          <div className="zy-map-marker">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
            </svg>
          </div>
        </div>
        <div className="zy-location-info">
          <span className="zy-location-name">📍 Shared Location</span>
          <span className="zy-location-address">Open in Maps</span>
        </div>
      </div>
    );
  }

  if (messageType === 'file_uploading') {
    return (
      <div className="zy-media-uploading">
        <div className="zy-upload-content">
          <div className="zy-upload-progress-ring">
            <svg viewBox="0 0 36 36" className="zy-progress-svg">
              <path className="zy-progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="zy-progress-bar" strokeDasharray={`${metadata?.progress || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="zy-upload-percent">{metadata?.progress || 0}%</span>
          </div>
          <div className="zy-upload-text">
            <span className="zy-upload-label">Uploading {metadata?.name || 'File'}</span>
            <span className="zy-upload-meta">{(metadata?.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    );
  }

  if (messageType === 'upload_failed') {
    return (
      <div className="zy-media-error">
        <div className="zy-media-error-icon">⚠️</div>
        <div className="zy-media-error-text">
          <span>Upload Failed</span>
          <button className="zy-media-retry-link" onClick={() => {/* Bubble handles retry */}}>Retry</button>
        </div>
      </div>
    );
  }

  return <div className="zy-media-fallback">{message.content}</div>;
};

export default PremiumMediaRenderer;