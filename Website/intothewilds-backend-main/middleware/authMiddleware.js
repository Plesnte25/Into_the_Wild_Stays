// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    // console.log(authHeader)
    if (!authHeader) {
      return res.status(401).json({ 
        error: { 
          code: 'BAD_REQUEST_ERROR',
          description: 'No authorization header' 
        }
      });
    }

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: { 
          code: 'BAD_REQUEST_ERROR',
          description: 'No token provided' 
        }
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // console.log('JWT Verification Error:', err);
        return res.status(401).json({ 
          error: { 
            code: 'BAD_REQUEST_ERROR',
            description: 'Authentication failed' 
          }
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    // console.log('Auth Middleware Error:', error);
    return res.status(500).json({ 
      error: { 
        code: 'SERVER_ERROR',
        description: 'Internal server error' 
      }
    });
  }
};

// Check user role
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
    