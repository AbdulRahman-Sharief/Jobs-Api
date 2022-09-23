require('dotenv').config({ path: './config.env' });
require('express-async-errors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const jobsRouter = require('./routes/jobsRouter');
const userRouter = require('./routes/userRouter');
const globalErrorhandler = require('./controllers/errorController');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const authController = require('./controllers/authController');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use(express.json());
// extra packages
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.options('*', cors());
app.use(xss());
// app.use(rateLimiter);
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Requests from this IP , Please try again in an hour!',
});
app.use('/api', limiter);
app.use(mongoSanitize());
// routes
app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use(morgan('dev'));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/jobs', jobsRouter);

app.use(globalErrorhandler);
// app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);

module.exports = app;
