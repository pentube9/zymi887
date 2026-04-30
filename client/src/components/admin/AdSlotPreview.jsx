import React from 'react';
import './AdControlCenter.css';

const AdSlotPreview = ({ type, network }) => {
  return (
    <div className={`zy-ad-preview-slot ${type}`}>
      <div className="zy-ad-preview-label">
        <span className="icon">
          {type === 'banner' ? '📐' : type === 'interstitial' ? '📱' : '📝'}
        </span>
        <span className="text">{type.toUpperCase()} PREVIEW</span>
      </div>
      <div className="zy-ad-preview-network">
        Via {network ? network.toUpperCase() : 'NO NETWORK'}
      </div>
    </div>
  );
};

export default AdSlotPreview;
