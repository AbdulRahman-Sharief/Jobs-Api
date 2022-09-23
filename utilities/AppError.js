class AppError extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'NOT FOUND!' : 'ERROR!';
    Error.captureStackTrace(this, this.construstor);
  }
}

module.exports = AppError;
