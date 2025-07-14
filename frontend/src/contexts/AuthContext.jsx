import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getCurrentUser, signIn, signUp, signOut as amplifySignOut, confirmSignUp, resendSignUpCode, fetchAuthSession } from 'aws-amplify/auth';
import { setAuthToken, removeAuthToken } from '../services/api';

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

  const checkAuthState = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user was manually signed out (even in dev mode)
      const wasSignedOut = localStorage.getItem('manualSignOut') === 'true';
      if (wasSignedOut) {
        console.log('🚫 User was manually signed out - staying logged out');
        setUser(null);
        removeAuthToken();
        // Don't remove the flag here - keep it to prevent re-authentication
        return;
      }
      
      // Development bypass mode (only if not manually signed out)
      if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true') {
        const mockUser = {
          userId: 'dev-user-123',
          username: 'devuser',
          attributes: {
            email: 'dev@example.com',
            name: 'Development User',
            email_verified: 'true'
          }
        };
        setUser(mockUser);
        setAuthToken('dev-mock-token');
        console.log('🔧 Development bypass mode: Mock user authenticated');
        return;
      }
      
      const currentUser = await getCurrentUser();
      
      // Get the auth session to extract the JWT token
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      
      if (accessToken) {
        // Store the token for API calls
        setAuthToken(accessToken);
        console.log('Auth token stored successfully');
      } else {
        console.warn('No access token found in session');
        removeAuthToken();
      }
      
      setUser(currentUser);
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      removeAuthToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const signInUser = useCallback(async (email, password) => {
    try {
      const result = await signIn({
        username: email,
        password: password
      });
      
      console.log('Sign in result:', result);
      
      if (result.isSignedIn) {
        // Clear manual signout flag when successfully signing in
        localStorage.removeItem('manualSignOut');
        await checkAuthState();
        return result;
      }
      
      // Handle different sign-in states
      if (result.nextStep) {
        console.log('Next step required:', result.nextStep);
        
        if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          throw new Error('Please verify your email address first. Check your email for the verification code.');
        }
        
        if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          throw new Error('New password required. Please contact support.');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific error types
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email address first. Check your email for the verification code.');
      }
      
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password. Please try again.');
      }
      
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this email address.');
      }
      
      throw error;
    }
  }, [checkAuthState]);

  const signUpUser = useCallback(async (email, password, firstName, lastName) => {
    try {
      // Simple sign up - only email required for the new User Pool
      const result = await signUp({
        username: email,
        password: password,
        attributes: {
          email: email
        }
      });
      
      console.log('Sign up result:', result);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      
      if (error.name === 'UsernameExistsException') {
        throw new Error('An account with this email already exists. Please try signing in instead.');
      }
      
      throw error;
    }
  }, []);

  const confirmSignUpUser = useCallback(async (email, confirmationCode) => {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode
      });
      
      console.log('Confirm sign up result:', result);
      return result;
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  }, []);

  const resendSignUpCodeUser = useCallback(async (email) => {
    try {
      const result = await resendSignUpCode({
        username: email
      });
      
      console.log('Resend code result:', result);
      return result;
    } catch (error) {
      console.error('Resend code error:', error);
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      // Mark that user manually signed out (important for dev bypass mode)
      localStorage.setItem('manualSignOut', 'true');
      
      // Try to sign out from Amplify (might fail in dev mode)
      try {
        await amplifySignOut();
      } catch (amplifyError) {
        console.log('Amplify sign out not needed in dev mode:', amplifyError.message);
      }
      
      setUser(null);
      removeAuthToken();
      
      // Clear any stored user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      console.log('✅ User signed out successfully - redirecting to home');
      
      // Force redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state and redirect
      localStorage.setItem('manualSignOut', 'true');
      setUser(null);
      removeAuthToken();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw error;
    }
  }, []);

  // Function to clear manual signout (for sign in)
  const clearSignOut = useCallback(() => {
    localStorage.removeItem('manualSignOut');
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signIn: signInUser,
    signUp: signUpUser,
    signOut: signOutUser,
    confirmSignUp: confirmSignUpUser,
    resendSignUpCode: resendSignUpCodeUser,
    checkAuthState,
    clearSignOut
  }), [user, loading, signInUser, signUpUser, signOutUser, confirmSignUpUser, resendSignUpCodeUser, checkAuthState, clearSignOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 