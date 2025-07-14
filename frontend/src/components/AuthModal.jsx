import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, confirmSignUp, resendSignUpCode, clearSignOut } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (showVerification) {
        // Handle email verification
        await confirmSignUp(verificationEmail, formData.verificationCode);
        setSuccess('Email verified successfully! You can now sign in.');
        // Auto-switch to sign-in after successful verification
        setTimeout(() => {
          setShowVerification(false);
          setIsSignUp(false);
          setFormData(prev => ({ ...prev, email: verificationEmail, verificationCode: '' }));
          setSuccess('');
        }, 2000);
      } else if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const result = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        
        if (result.nextStep && result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setVerificationEmail(formData.email);
          setShowVerification(true);
          setSuccess('Account created! Please check your email for the verification code.');
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          // Auto-switch to sign-in after successful registration
          setTimeout(() => {
            setIsSignUp(false);
            setFormData(prev => ({ ...prev, confirmPassword: '', firstName: '', lastName: '' }));
            setSuccess('');
          }, 2000);
        }
      } else {
        // Handle sign in
        clearSignOut(); // Clear any manual signout flag
        await signIn(formData.email, formData.password);
        setSuccess('Welcome back! Redirecting...');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      
      // If user needs to verify email, show verification form
      if (err.message && err.message.includes('verify your email')) {
        setVerificationEmail(formData.email);
        setShowVerification(true);
        setError(''); // Clear error since we're showing verification form
        setSuccess('Please check your email for the verification code.');
      }
      
      // If user already exists during sign-up, suggest sign-in
      if (err.message && err.message.includes('already exists')) {
        setError(err.message + ' Would you like to sign in instead?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await resendSignUpCode(verificationEmail);
      setSuccess('Verification code resent! Please check your email.');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      verificationCode: ''
    });
    setError('');
    setSuccess('');
    setShowVerification(false);
    setVerificationEmail('');
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setShowVerification(false);
    setError('');
    setSuccess('');
    // Keep email if switching from sign-up to sign-in
    if (isSignUp) {
      setFormData(prev => ({
        email: prev.email,
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        verificationCode: ''
      }));
    } else {
      setFormData(prev => ({
        email: prev.email,
        password: prev.password,
        confirmPassword: '',
        firstName: '',
        lastName: '',
        verificationCode: ''
      }));
    }
  };

  const goBackToSignIn = () => {
    setShowVerification(false);
    setIsSignUp(false);
    setError('');
    setSuccess('');
    // Keep the email for convenience
    setFormData(prev => ({
      email: verificationEmail || prev.email,
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      verificationCode: ''
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {showVerification ? 'Verify Email' : (isSignUp ? 'Create Account' : 'Sign In')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            {error.includes('already exists') && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-sm underline hover:no-underline"
                >
                  Switch to Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {showVerification ? (
            // Email verification form
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We've sent a verification code to <strong>{verificationEmail}</strong>
                </p>
              </div>
              
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.verificationCode}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Resend Code
                </button>
                <br />
                <button
                  type="button"
                  onClick={goBackToSignIn}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          ) : (
            // Regular sign in/up form
            <>
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="Enter your email"
                  autoFocus={!isSignUp}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  placeholder="Enter your password"
                  minLength="8"
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="Confirm your password"
                    minLength="8"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </>
          )}
        </form>

        {!showVerification && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Secure Authentication:</strong> {isSignUp ? 'Create your account with AWS Cognito security.' : 'Sign in securely with your credentials.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 