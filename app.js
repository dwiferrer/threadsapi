var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const passport = require('passport')
const authenticate = require('./authenticate')
const config = require('./config')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const threadRouter = require("./routes/threadRouter");

const mongoose = require("mongoose");

const url = config.mongoUrl
const connect = mongoose.connect(url)

connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => { console.log(err)})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(passport.initialize())

//app.use('/', indexRouter);
app.use("/users", usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use("/threads", threadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.jade');
});

module.exports = app;
