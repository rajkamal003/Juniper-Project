// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionMetadata, setSessionMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(900); // Default 15 mins (in seconds)
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  const getSessionIdFromToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload).session_id;
    } catch (e) {
      return null;
    }
  };

  // Ping the backend root endpoint (no DB required) to verify reachability
  const checkBackendHealth = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      await fetch(`${baseURL}/`, { method: 'GET' });
      setIsBackendOffline(false);
    } catch {
      setIsBackendOffline(true);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setSessionMetadata(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/api/auth/profile');
      setUser(response.data);
      setIsBackendOffline(false);

      const sessId = getSessionIdFromToken(token);
      if (sessId) {
        try {
          const sessionsResp = await api.get('/api/users/sessions');
          const currentSession = sessionsResp.data.find(s => s.session_id === sessId);
          if (currentSession) {
            setSessionMetadata(currentSession);
          } else {
            setSessionMetadata({ session_id: sessId, browser: 'Web Client', operating_system: 'Terminal', ip_address: '127.0.0.1' });
          }
        } catch (e) {
          if (!e.response) {
            // Network-level failure on /api/users/sessions — run health check
            await checkBackendHealth();
          }
          setSessionMetadata({ session_id: sessId, browser: 'Web Client', operating_system: 'Terminal', ip_address: '127.0.0.1' });
        }
      }
    } catch (err) {
      if (!err.response) {
        // Network-level failure — verify via health check before marking offline
        await checkBackendHealth();
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        setUser(null);
        setSessionMetadata(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get('/api/auth/settings');
      if (response.data && response.data.session_timeout) {
        setSessionTimeout(response.data.session_timeout);
      }
      // Settings loaded — backend is clearly reachable
      setIsBackendOffline(false);
    } catch (error) {
      // A settings endpoint failure (e.g. DB error returning 500) does NOT mean
      // the backend process is down. Only mark offline on a true network failure
      // AND only after confirming the root health endpoint is also unreachable.
      if (!error.response) {
        await checkBackendHealth();
      }
      console.warn("Failed to fetch dynamic session timeout settings, using default 15 minutes.", error);
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setIsBackendOffline(false);
    await checkBackendHealth();
    await checkAuth();
    await fetchSystemSettings();
  };

  useEffect(() => {
    checkBackendHealth();
    checkAuth();
    fetchSystemSettings();
    
    // Listen for global session expiration events (from API interceptor)
    const handleSessionExpired = () => {
      setUser(null);
      setSessionMetadata(null);
      toast.error('Session expired. Please log in again.');
    };
    
    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

const extractErrorMessage = (error, defaultMsg) => {
  const detail = error.response?.data?.detail;
  if (!detail) return defaultMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map(item => {
      if (typeof item === 'string') return item;
      if (item && item.msg) {
        const field = item.loc && item.loc.length > 1 ? `${item.loc[item.loc.length - 1]}: ` : '';
        return `${field}${item.msg}`;
      }
      return JSON.stringify(item);
    });
    return messages.join(', ');
  }
  if (typeof detail === 'object' && detail.msg) {
    return detail.msg;
  }
  return defaultMsg;
};

  const login = async (email, password, rememberMe = false, portal = null) => {
    setLoading(true);
    try {
      // Gather browser/device info for session auditing
      const userAgent = navigator.userAgent;
      let browser = "Unknown Browser";
      let os = "Unknown OS";
      
      if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
      else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
      else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
      else if (userAgent.indexOf("Edge") > -1) browser = "Edge";
      
      if (userAgent.indexOf("Windows") > -1) os = "Windows";
      else if (userAgent.indexOf("Macintosh") > -1) os = "macOS";
      else if (userAgent.indexOf("Linux") > -1) os = "Linux";
      else if (userAgent.indexOf("Android") > -1) os = "Android";
      else if (userAgent.indexOf("iPhone") > -1) os = "iOS";

      const loginPayload = {
        email,
        password,
        portal: portal,
        remember_me: rememberMe,
        device_name: "Desktop Web client",
        browser: browser,
        operating_system: os,
        ip_address: "127.0.0.1"
      };

      const response = await api.post('/api/auth/login', loginPayload);
      
      if (response.data && response.data.mfa_required) {
        return response.data;
      }

      const { access_token, refresh_token, user: userData } = response.data;

      if (rememberMe) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('refresh_token', refresh_token);
      }

      setUser(userData);
      
      const sessId = getSessionIdFromToken(access_token);
      setSessionMetadata({
        session_id: sessId,
        browser: browser,
        operating_system: os,
        ip_address: "127.0.0.1"
      });

      toast.success('Logged in successfully!');
      return userData;
    } catch (error) {
      const errorMsg = extractErrorMessage(error, 'Login failed. Please try again.');
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyFacultyMFA = async (tempToken, totpCode, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/verify-faculty-mfa', {
        temp_token: tempToken,
        totp_code: totpCode
      });
      const { access_token, refresh_token, user: userData } = response.data;

      if (rememberMe) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('refresh_token', refresh_token);
      }

      setUser(userData);
      toast.success('Faculty Authenticator Verification Successful!');
      return userData;
    } catch (error) {
      const errorMsg = extractErrorMessage(error, 'Invalid Authenticator Code. Please try again.');
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.warn("Logout request failed on server, clearing client session anyway", error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      
      if (localStorage.getItem('remember_me_enabled') !== 'true') {
        localStorage.removeItem('remember_me_email');
        localStorage.removeItem('remember_me_password');
      }

      setUser(null);
      setSessionMetadata(null);
      setLoading(false);
      toast.success('Logged out successfully.');
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', formData);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      const errorMsg = extractErrorMessage(error, 'Registration failed. Please try again.');
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      sessionMetadata,
      loading, 
      isAuthenticated: !!user, 
      sessionTimeout, 
      login, 
      verifyFacultyMFA,
      logout, 
      register, 
      refreshProfile: checkAuth,
      isBackendOffline,
      retryConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
