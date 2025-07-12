const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { COGNITO_CONFIG } = require('../config/aws');

// JWKS client for Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${COGNITO_CONFIG.UserPoolId}/.well-known/jwks.json`,
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30s
});

// Get signing key from JWKS
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify Cognito JWT token
function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: COGNITO_CONFIG.ClientId,
      issuer: `https://cognito-idp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${COGNITO_CONFIG.UserPoolId}`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

// Main authentication middleware
async function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // For development mode, allow bypass authentication
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      // Mock user for development
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
      };
      return next();
    }

    // Verify the token with Cognito
    const decoded = await verifyCognitoToken(token);
    
    // Check if token is an access token
    if (decoded.token_use !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Expected access token.',
        error: 'INVALID_TOKEN_TYPE'
      });
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        error: 'TOKEN_EXPIRED'
      });
    }

    // Attach user information to request object
    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      email_verified: decoded.email_verified,
      name: decoded.name,
      sub: decoded.sub,
      iss: decoded.iss,
      aud: decoded.aud,
      token_use: decoded.token_use,
      exp: decoded.exp,
      iat: decoded.iat,
      scope: decoded.scope,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
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
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: errorCode
    });
  }
}

// Optional authentication middleware (doesn't fail if no token)
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, but that's okay for optional auth
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // For development mode
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
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
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        iat: Math.floor(Date.now() / 1000),
      };
      return next();
    }

    const decoded = await verifyCognitoToken(token);
    
    if (decoded.token_use === 'access') {
      req.user = {
        userId: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        email_verified: decoded.email_verified,
        name: decoded.name,
        sub: decoded.sub,
        iss: decoded.iss,
        aud: decoded.aud,
        token_use: decoded.token_use,
        exp: decoded.exp,
        iat: decoded.iat,
        scope: decoded.scope,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    req.user = null;
    next();
  }
}

// Admin authentication middleware
async function adminAuthMiddleware(req, res, next) {
  try {
    // First, run the regular auth middleware
    await authMiddleware(req, res, () => {});
    
    // Check if user has admin privileges
    // This depends on how you've set up admin permissions in Cognito
    const userGroups = req.user.scope ? req.user.scope.split(' ') : [];
    
    if (!userGroups.includes('admin') && !userGroups.includes('aws.cognito.signin.user.admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: 'AUTH_ERROR'
    });
  }
}

// Middleware to check if user owns the resource
function checkResourceOwnership(req, res, next) {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;
  
  if (userId !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
      error: 'RESOURCE_ACCESS_DENIED'
    });
  }
  
  next();
}

// Middleware to check if user owns the resource OR is admin
function checkResourceOwnershipOrAdmin(req, res, next) {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;
  const userGroups = req.user?.scope ? req.user.scope.split(' ') : [];
  const isAdmin = userGroups.includes('admin') || userGroups.includes('aws.cognito.signin.user.admin');
  
  if (userId !== currentUserId && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
      error: 'RESOURCE_ACCESS_DENIED'
    });
  }
  
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminAuthMiddleware,
  checkResourceOwnership,
  checkResourceOwnershipOrAdmin,
}; 