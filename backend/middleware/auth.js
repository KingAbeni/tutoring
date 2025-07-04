const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKey';

function auth(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (role && payload.role !== role) return res.sendStatus(403);

      req.user = payload;
      next();
    } catch {
      res.sendStatus(401);
    }
  };
}

module.exports = auth;
// This middleware checks for a valid JWT token in the Authorization header.