const path = require('path');
const express = require('express');
const logger = require('morgan');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const { userRoutes, planRoutes } = require('./routes');

const app = express();

app.use(cors());

app.options('*', cors());

app.use(helmet());

app.use(xss());

app.use(hpp());

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
}

require('./controllers/passport')(passport);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/plans', planRoutes);


app.all('*', (req, res, next) => {
	next(new appError(`Can't get ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);


module.exports = app;
