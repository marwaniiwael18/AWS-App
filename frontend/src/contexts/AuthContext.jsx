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
      
      // Development bypass mode
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
        console.log('Development bypass mode: Mock user authenticated');
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
      await amplifySignOut();
      setUser(null);
      removeAuthToken();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signIn: signInUser,
    signUp: signUpUser,
    signOut: signOutUser,
    confirmSignUp: confirmSignUpUser,
    resendSignUpCode: resendSignUpCodeUser,
    checkAuthState
  }), [user, loading, signInUser, signUpUser, signOutUser, confirmSignUpUser, resendSignUpCodeUser, checkAuthState]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 