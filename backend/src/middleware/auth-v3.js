/**
 * AWS SDK v3 Authentication Middleware for SkillSwap
 * Modern Cognito JWT token verification with AWS SDK v3
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { COGNITO_CONFIG, AUTH_CONFIG } = require('../config/aws-v3');

console.log('🔐 Auth Middleware Loaded:', {
  cognito: COGNITO_CONFIG.UserPoolId,
  region: COGNITO_CONFIG.Region,
  bypassMode: AUTH_CONFIG.BYPASS_MODE
});

// =================================
// 🔑 JWKS Client Setup
// =================================

// Create JWKS client for Cognito public key verification
const jwksClientInstance = jwksClient({
  jwksUri: COGNITO_CONFIG.jwksUri,
  requestHeaders: {},
  timeout: 30000,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 1000 * 60 * 60 * 24, // 24 hours
});

// =================================
// 🛡️ Token Verification Functions
// =================================

/**
 * Get signing key from Cognito JWKS
 */
function getSigningKey(header, callback) {
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('🚫 JWKS key retrieval error:', err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Verify Cognito JWT token
 */
function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getSigningKey, {
      audience: COGNITO_CONFIG.ClientId,
      issuer: COGNITO_CONFIG.issuer,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        console.error('🚫 Token verification failed:', err.message);
        return reject(err);
      }
      
      console.log('✅ Token verified successfully for user:', decoded.sub);
      resolve(decoded);
    });
  });
}

// =================================
// 🔒 Main Authentication Middleware
// =================================

/**
 * Main authentication middleware
 * Supports both development bypass and production Cognito verification
 */
async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // =================================
    // 🔧 Development Bypass Mode
    // =================================
    if (AUTH_CONFIG.BYPASS_MODE) {
      console.log('🔧 Development bypass mode active');
      
      // Create mock user for development
      req.user = {
        userId: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        username: 'devuser',
        sub: 'dev-user-123',
        email_verified: true,
        iss: 'development',
        aud: 'development',
        token_use: 'access',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
        scope: 'openid email profile',
      };
      
      return next();
    }

    // =================================
    // 🔐 Production Cognito Verification
    // =================================
    
    console.log('🔐 Verifying Cognito token...');
    
    // Verify the token with Cognito JWKS
    const decoded = await verifyCognitoToken(token);
    
    // Validate token type
    if (decoded.token_use !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Expected access token.',
        error: 'INVALID_TOKEN_TYPE'
      });
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        error: 'TOKEN_EXPIRED'
      });
    }

    // Attach comprehensive user information to request
    req.user = {
      userId: decoded.sub,
      username: decoded.username || decoded['cognito:username'],
      email: decoded.email,
      email_verified: decoded.email_verified === true || decoded.email_verified === 'true',
      name: decoded.name || decoded.given_name || decoded.email?.split('@')[0],
      sub: decoded.sub,
      iss: decoded.iss,
      aud: decoded.aud,
      token_use: decoded.token_use,
      exp: decoded.exp,
      iat: decoded.iat,
      scope: decoded.scope,
      groups: decoded['cognito:groups'] || [],
    };

    console.log('✅ User authenticated:', {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name
    });

    next();
    
  } catch (error) {
    console.error('🚫 Authentication error:', error);
    
    // Handle specific error types
    let errorMessage = 'Invalid token.';
    let errorCode = 'INVALID_TOKEN';
    
    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed token.';
      errorCode = 'MALFORMED_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired.';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token not active yet.';
      errorCode = 'TOKEN_NOT_ACTIVE';
    } else if (error.message && error.message.includes('JwksError')) {
      errorMessage = 'Token verification failed. Please try again.';
      errorCode = 'VERIFICATION_FAILED';
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: errorCode,
      timestamp: new Date().toISOString()
    });
  }
}

// =================================
// 🔓 Optional Authentication Middleware
// =================================

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided - useful for public endpoints that can benefit from user context
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // Development bypass mode
    if (AUTH_CONFIG.BYPASS_MODE) {
      req.user = {
        userId: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        username: 'devuser',
        sub: 'dev-user-123',
        email_verified: true,
      };
      return next();
    }

    // Try to verify token, but don't fail if invalid
    const decoded = await verifyCognitoToken(token);
    
    if (decoded.token_use === 'access') {
      req.user = {
        userId: decoded.sub,
        username: decoded.username || decoded['cognito:username'],
        email: decoded.email,
        email_verified: decoded.email_verified === true || decoded.email_verified === 'true',
        name: decoded.name || decoded.given_name || decoded.email?.split('@')[0],
        sub: decoded.sub,
        groups: decoded['cognito:groups'] || [],
      };
    } else {
      req.user = null;
    }

    next();
    
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    console.log('⚠️ Optional auth failed (continuing):', error.message);
    req.user = null;
    next();
  }
}

// =================================
// 👑 Admin Authentication Middleware
// =================================

/**
 * Admin authentication middleware
 * Requires valid token AND admin privileges
 */
async function adminAuthMiddleware(req, res, next) {
  try {
    // First run regular auth
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Check for admin privileges
    const userGroups = req.user.groups || [];
    const hasAdminAccess = userGroups.includes('admin') || 
                          userGroups.includes('administrators') ||
                          req.user.scope?.includes('admin');
    
    if (!hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    console.log('👑 Admin access granted for user:', req.user.userId);
    next();
    
  } catch (error) {
    console.error('🚫 Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: 'AUTH_ERROR'
    });
  }
}

// =================================
// 📤 Export Middleware Functions
// =================================

module.exports = {
  authMiddleware,
  optionalAuthMiddleware, 
  adminAuthMiddleware,
  
  // Utility functions for direct use
  verifyCognitoToken,
  
  // Configuration access
  AUTH_CONFIG,
  COGNITO_CONFIG,
}; 