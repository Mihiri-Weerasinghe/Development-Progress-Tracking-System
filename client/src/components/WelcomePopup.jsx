import React, { useState, useEffect } from 'react';
import OfficeLogo from './OfficeLogo';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePopup({ isOpen, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(6);

  useEffect(() => {
    if (!isOpen) return;

    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 6 seconds finished - automatically close popup and reveal account options
      onClose();
    }
  }, [isOpen, secondsLeft, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-backdrop">
      <div className="popup-card animate-zoom-in">
        {/* Top Government Badge */}
        <div className="popup-gov-badge">
          <Sparkles size={14} className="popup-sparkle" />
          <span>Government of Sri Lanka &bull; Central Province</span>
        </div>

        {/* Official Logo */}
        <div className="popup-logo-wrapper">
          <OfficeLogo size={120} rounded={false} />
        </div>

        {/* Exact Welcome Text Requested by User */}
        <h2 className="popup-welcome-heading">
          Welcome to Development Progress Tracking System Zonal education office katugastota
        </h2>

        {/* Sinhala Sub-heading */}
        <p className="popup-sinhala-text">
          කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලයීය සංවර්ධන ප්‍රගති අධීක්ෂණ පද්ධතිය වෙත සාදරයෙන් පිළිගනිමු
        </p>

        {/* Footer actions without any loading line */}
        <div className="popup-footer-action">
          <span className="popup-timer-text">
            Opening accounts portal in {secondsLeft}s...
          </span>
          <button
            type="button"
            className="popup-continue-btn"
            onClick={onClose}
          >
            <span>Proceed to Login / Register</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
