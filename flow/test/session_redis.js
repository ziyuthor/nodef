
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');

var app = express();

var redis = require("redis");
var client = redis.createClient(6380, "192.168.3.254");  
var hour = 10000; // 10s
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
    var views = req.session.views;

    console.log("17    " +  req.session.id);
    if (!views) {
        console.log("view is null");
        views = req.session.views = {};

        client.send_command("set", [req.session.id, "1"], function(err, reply) {
            if (reply != null)
                console.log(reply.toString());
        });
        client.send_command("expire", [req.session.id, hour], function(err, reply) {
            if (reply != null)
                console.log(reply.toString());
        });
    }
    else
    {
    }

    // get the url pathname
    var pathname = parseurl(req).pathname;

    // count the views
    views[pathname] = (views[pathname] || 0) + 1;

    next();
});

app.get('/foo', function (req, res, next) {
    client.send_command("get", [req.session.id], function(err, reply) {
        if (reply != null)
            console.log(reply.toString());
    });
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;

    res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
    console.log(req.session.id);
});
app.post('/foo', function (req, res, next) {
    client.send_command("get", [req.session.id], function(err, reply) {
        if (reply != null)
            console.log(reply.toString());
    });
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;

    res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
    console.log(req.session.id);
});

app.get('/bar', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;

    res.send('you viewed this page ' + req.session.views['/bar'] + ' times');
    console.log(req.session.id);
});
app.post('/bar', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;

    res.send('you viewed this page ' + req.session.views['/bar'] + ' times');
    console.log(req.session.id);
});

app.get('/', function (req, res, next) {
    var hour = 10000;
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;
    res.send('<form action="/foo" method="get"><input type="submit" value="foo"></input></form> <form action="/bar" method="get"><input type="submit" value="bar"></input></form>');
});

app.listen(8000);

