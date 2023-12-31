const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

//* routes imports
const usersRoute = require('./routes/users.route');
const restaurantsRoute = require('./routes/restaurant.route');
const mealsRoute = require('./routes/meal.route');
const ordersRoute = require('./routes/order.route');

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

console.log(process.env.NODE_ENV);

//* routes
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/restaurants', restaurantsRoute);
app.use('/api/v1/meals', mealsRoute);
app.use('/api/v1/orders', ordersRoute);

app.use(globalErrorHandler);

module.exports = app;
