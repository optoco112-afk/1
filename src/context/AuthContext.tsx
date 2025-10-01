import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff' | 'artist';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const resetTimer = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);
      
      if (user) {
        inactivityTimer = setTimeout(() => {
          // Check if user is still inactive
          if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT) {
            logout();
            alert('You have been logged out due to inactivity.');
          }
        }, INACTIVITY_TIMEOUT);
      }
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    if (user) {
      // Add event listeners for user activity
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Start the timer
      resetTimer();
    }

    // Cleanup function
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user]);
  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('tattoo_studio_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('tattoo_studio_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Query staff table for matching credentials
      const { data: staffData, error } = await supabase
        .from('staff')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !staffData) {
        console.error('Login error:', error);
        return false;
      }

      const userObj: User = {
        id: staffData.id,
        username: staffData.username,
        name: staffData.name,
        role: staffData.role,
        permissions: staffData.permissions
      };

      setUser(userObj);
      localStorage.setItem('tattoo_studio_user', JSON.stringify(userObj));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tattoo_studio_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};