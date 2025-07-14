const jwt = require('jsonwebtoken');
// Legacy auth middleware - use auth-v3.js for new development

// Configure AWS Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Mock JWT secret for development (in production, use proper AWS Cognito verification)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT tokens
const authenticate = async (req, res, next) => {
  // For development mode, allow bypass authentication
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Mock user for development
    req.user = {
      userId: 'dev-user-123',
      email: 'dev@example.com',
      name: 'Development User',
      id: 'dev-user-123',
      verified: true
    };
    return next();
  }

  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // In development, use simple JWT verification
    if (process.env.NODE_ENV === 'development') {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } else {
      // In production, verify AWS Cognito token
      await verifyAwsCognitoToken(token, req, res, next);
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
};

// Verify AWS Cognito token (for production)
const verifyAwsCognitoToken = async (token, req, res, next) => {
  try {
    // This would involve fetching the public keys from AWS Cognito
    // and verifying the JWT token signature
    // For now, we'll implement a basic verification
    
    const params = {
      AccessToken: token
    };

    const result = await cognito.getUser(params).promise();
    
    // Extract user information from Cognito response
    const user = {
      id: result.UserSub,
      email: result.UserAttributes.find(attr => attr.Name === 'email')?.Value,
      name: result.UserAttributes.find(attr => attr.Name === 'name')?.Value,
      verified: result.UserAttributes.find(attr => attr.Name === 'email_verified')?.Value === 'true'
    };

    req.user = user;
    next();
  } catch (error) {
    console.error('AWS Cognito verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid AWS Cognito token',
      timestamp: new Date().toISOString()
    });
  }
};

// Generate JWT token (for development)
const generateToken = (userId, email, name) => {
  return jwt.sign(
    { 
      id: userId,
      email: email,
      name: name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Middleware to check if user owns the resource
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (!req.user || req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.',
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  // For development mode, allow bypass authentication
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Mock user for development
    req.user = {
      userId: 'dev-user-123',
      email: 'dev@example.com',
      name: 'Development User',
      id: 'dev-user-123',
      verified: true
    };
    return next();
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token invalid but continue without user
    console.log('Optional auth - invalid token:', error.message);
  }
  
  next();
};

module.exports = {
  authenticate,
  generateToken,
  requireAdmin,
  requireOwnership,
  optionalAuth,
  verifyAwsCognitoToken
}; 