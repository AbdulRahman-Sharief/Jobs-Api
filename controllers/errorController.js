const AppError = require('../utilities/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value ${
    err.keyValue[Object.keys(err.keyValue)[0]]
  }. Please pick another field value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token , Please Login Again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please login again!!', 401);

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Failed';
  console.error('ERROR 💥', err);
  if (req.originalUrl.startsWith('/api')) {
    // console.log(err);
    // console.log(error);
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('ERROR 💥', err);
};
