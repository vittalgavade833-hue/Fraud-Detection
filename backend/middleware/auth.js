const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');
const { ErrorResponse } = require('./errorHandler');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new ErrorResponse('Not authorized to access this route', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return next(new ErrorResponse('User not found', 401));
    if (!user.is_active) return next(new ErrorResponse('Account deactivated', 403));

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Role '${req.user.role}' is not authorized`, 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
