export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };
  
  export const sendResponse = (res, statusCode, data, message = 'Success') => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  export const sendError = (res, statusCode, message) => {
    res.status(statusCode).json({
      success: false,
      message,
    });
  };