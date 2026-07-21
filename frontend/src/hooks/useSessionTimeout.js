// frontend/src/hooks/useSessionTimeout.js
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useSessionTimeout = () => {
  const { isAuthenticated, logout, sessionTimeout } = useAuth();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (isAuthenticated) {
      // Timeout is configured in seconds; convert to ms
      timerRef.current = setTimeout(() => {
        console.log(`User inactive for ${sessionTimeout} seconds. Automatic logout triggered.`);
        logout();
      }, sessionTimeout * 1000);
    }
  };

  useEffect(() => {
    // Only monitor activity when logged in
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Initialize timer
    resetTimer();

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Detach listeners
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, sessionTimeout]);
};
