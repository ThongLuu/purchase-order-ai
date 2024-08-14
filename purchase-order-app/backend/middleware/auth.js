const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'You are not logged in. Please log in and try again.' });
    }

    const tokenValue = token.replace('Bearer ', '');
    const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ message: 'You are not logged in. Please log in and try again.' });
    }

    req.user = verified.user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'You are not logged in. Please log in and try again.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
    res.status(401).json({ message: 'You are not logged in. Please log in and try again.' });
  }
};

module.exports = auth;