const User = require('../models/User');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utilities/AppError');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const signToken = async (id, username) => {
  return JWT.sign({ userID: id, name: username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = async (id, username, statusCode, req, res) => {
  const token = await signToken(id, username);

  res.cookie(JWT, token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  req.body.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user: { name: username },
    token,
  });
};
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in !! Please login to get access', 401)
    );
  }
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  const currentUser = await User.findById(decoded.userID);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token is no longer exists.', 401)
    );
  }
  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError(
  //       'User has recently changed their password, please login again!!',
  //       401
  //     )
  //   );
  // }
  req.user = currentUser;
  // console.log(req.user);
  res.locals.user = currentUser;
  // console.log(res.locals.user);
  next();
};
exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    next(
      new AppError(
        'Please Provide a name, email And a password',
        StatusCodes.BAD_REQUEST
      )
    );
  const user = await User.create({ ...req.body });
  createSendToken(user._id, user.name, StatusCodes.CREATED, req, res);
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    next(
      new AppError(
        'Please Provide an email And its password',
        StatusCodes.BAD_REQUEST
      )
    );
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(
      new AppError('Invalid Email or Password!', StatusCodes.UNAUTHORIZED)
    );
  }
  console.log(user._id);
  createSendToken(user._id, user.name, StatusCodes.OK, req, res);
};
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.JWT) {
      const decoded = await promisify(JWT.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );
      console.log(decoded);
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // if (currentUser.changePasswordAfter(decoded.iat)) {
      //   return next();
      // }
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
