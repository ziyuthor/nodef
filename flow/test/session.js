
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
  var views = req.session.views;

  console.log(req.session.id);
  if (!views) {
    views = req.session.views = {};
  }

  // get the url pathname
  var pathname = parseurl(req).pathname;

  // count the views
  views[pathname] = (views[pathname] || 0) + 1;

  next();
});

app.get('/foo', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;

    res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
    console.log(req.session);
    console.log(req.session.id);
});

app.get('/bar', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;
    res.send('you viewed this page ' + req.session.views['/bar'] + ' times');
});

app.get('/', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;
    res.send('you viewed this page ' + req.session.views['/'] + ' times');
});

app.listen(8000);