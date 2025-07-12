import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signUp, signOut as amplifySignOut } from 'aws-amplify/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Development mode - bypass AWS for now
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      
      if (isDevelopment) {
        // Mock user for development
        const mockUser = {
          username: 'demo@skillswap.com',
          attributes: {
            email: 'demo@skillswap.com',
            name: 'Demo User',
            sub: 'mock-user-id'
          }
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInUser = async (email, password) => {
    try {
      if (isDevelopment) {
        // Mock sign in for development
        const mockUser = {
          username: email,
          attributes: {
            email: email,
            name: 'Demo User',
            sub: 'mock-user-id'
          }
        };
        setUser(mockUser);
        return mockUser;
      }

      const result = await signIn({
        username: email,
        password: password
      });
      
      if (result.isSignedIn) {
        await checkAuthState();
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpUser = async (email, password, name) => {
    try {
      if (isDevelopment) {
        // Mock sign up for development
        const mockUser = {
          username: email,
          attributes: {
            email: email,
            name: name,
            sub: 'mock-user-id'
          }
        };
        setUser(mockUser);
        return mockUser;
      }

      const result = await signUp({
        username: email,
        password: password,
        attributes: {
          email: email,
          name: name
        }
      });
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      if (isDevelopment) {
        // Mock sign out for development
        setUser(null);
        return;
      }

      await amplifySignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn: signInUser,
    signUp: signUpUser,
    signOut: signOutUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 