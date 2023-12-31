const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

const User = require('../models/user.model');
const AppError = require('../utils/appError');
const Reviews = require('../models/review.model');
const Orders = require('../models/order.model');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );

  const user = await User.findOne({
    where: {
      id: decoded.id,
      status: true,
    },
  });

  if (!user) {
    return next(
      new AppError('The owner of this token it not longer available', 401)
    );
  }

  req.currentUser = user;
  next();
});

exports.protectAccountOwner = catchAsync(async (req, res, next) => {
  const { user, currentUser } = req;

  if (user.id !== currentUser.id) {
    return next(new AppError('You do not own this account.', 401));
  }

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(
        new AppError('You do not have permission to perfom this action.!', 403)
      );
    }

    next();
  };
};

exports.protectReviewOwner = catchAsync(async (req, res, next) => {
  const { id, restaurantId } = req.params;
  const { currentUser } = req;

  const review = await Reviews.findOne({
    where: {
      id,
      restaurantId,
      status: true,
    },
  });

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.userId !== currentUser.id) {
    return next(new AppError("You can't modify reviews you don't own", 401));
  }

  req.review = review;
  next();
});

exports.protectOrderOwner = catchAsync(async (req, res, next) => {
  const {id } = req.params
  const {currentUser} = req

  const order = await Orders.findOne({
    where:{id, status: 'active'}
  })

  if (!order) {
    return next(new AppError('Order not found',404))
  }

  if (order.userId !== currentUser.id) {
    return next(new AppError('You only can modify your orders',401))
  }

  req.order = order
  next()
});
