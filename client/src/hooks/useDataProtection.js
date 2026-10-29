import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to enforce data confidentiality:
 * - Prevents text selection
 * - Blocks Ctrl+C / Cmd+C (Copy), Ctrl+X (Cut), Ctrl+A (Select All), Ctrl+U (View Source), Ctrl+S (Save Page)
 * - Disables Right-Click Context Menu
 * - Disables Drag & Drop
 * - Shows an alert notification when a copy/paste attempt is detected
 */
export function useDataProtection() {
  const [securityNotice, setSecurityNotice] = useState(null);

  const showNotice = useCallback((message) => {
    setSecurityNotice(message);
    const timer = setTimeout(() => {
      setSecurityNotice(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      showNotice('රහස්‍ය තොරතුරු ආරක්ෂණය: Right-click ක්‍රියාවලිය අක්‍රිය කර ඇත (Right-click disabled).');
    };

    // 2. Block Copy Event
    const handleCopy = (e) => {
      const isInput =
        e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      if (!isInput) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.clearData();
        }
        showNotice('තොරතුරු පිටපත් කිරීම (Copy) සීමා කර ඇත &bull; Confidential Data Protection Active.');
      }
    };

    // 3. Block Cut Event
    const handleCut = (e) => {
      const isInput =
        e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      if (!isInput) {
        e.preventDefault();
        showNotice('දත්ත කපා ඉවත් කිරීම (Cut) සීමා කර ඇත.');
      }
    };

    // 4. Block Drag & Drop (Dragging text / cards out)
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // 5. Block Keyboard Shortcuts
    const handleKeyDown = (e) => {
      const isInput =
        e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

      // Check if Ctrl or Cmd is pressed
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();

        // Block Ctrl+C (Copy) outside input
        if (key === 'c' && !isInput) {
          e.preventDefault();
          showNotice('තොරතුරු පිටපත් කිරීම (Copy) සීමා කර ඇත &bull; Confidential Data.');
          return;
        }

        // Block Ctrl+X (Cut) outside input
        if (key === 'x' && !isInput) {
          e.preventDefault();
          showNotice('දත්ත පිටපත් කිරීම සීමා කර ඇත &bull; Confidential Data.');
          return;
        }

        // Block Ctrl+A (Select All) outside input
        if (key === 'a' && !isInput) {
          e.preventDefault();
          showNotice('සියලු දත්ත තේරීම (Select All) සීමා කර ඇත.');
          return;
        }

        // Block Ctrl+U (View Source)
        if (key === 'u') {
          e.preventDefault();
          showNotice('පද්ධති මූල කේත බැලීම සීමා කර ඇත (Restricted).');
          return;
        }

        // Block Ctrl+S (Save Page)
        if (key === 's') {
          e.preventDefault();
          showNotice('පිටුව සුරැකීම (Save Page) සීමා කර ඇත.');
          return;
        }
      }

      // Block F12 (Developer Tools Shortcut)
      if (e.key === 'F12') {
        e.preventDefault();
        showNotice('ආරක්ෂිත පද්ධතියකි (Confidential Government System).');
      }
    };

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotice]);

  return { securityNotice, clearNotice: () => setSecurityNotice(null) };
}
