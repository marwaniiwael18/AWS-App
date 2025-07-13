import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signUp, signOut as amplifySignOut, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
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
  };

  const signUpUser = async (email, password, firstName, lastName) => {
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
  };

  const confirmSignUpUser = async (email, confirmationCode) => {
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
  };

  const resendSignUpCodeUser = async (email) => {
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
  };

  const signOutUser = async () => {
    try {
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
    confirmSignUp: confirmSignUpUser,
    resendSignUpCode: resendSignUpCodeUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 