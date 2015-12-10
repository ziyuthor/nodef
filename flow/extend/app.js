// 3rd party
var express = require('express');
var hbs = require('hbs');

var app = express();
var router = express.Router();

var bodyParser = require('body-parser');
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var dbconfig = require('../conf/dbconfig');
var mysql = require('mysql');

var async = require('async');

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

//app.use(express.bodyParser());

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

app.get('/login', function(req, res){
    console.log("login()");
    res.render('login', {title:'123', body:'abc'});
});

app.post('/login', urlencodedParser, function(req, res){
    /* connect directly */
    var conn = mysql.createConnection(dbconfig.mysql);
    conn.connect();

    var tasklist = {
        fun1: function(cb, results){
            conn.query('SELECT * from customer where name=\'' + req.body.uname + '\'', function(err, rows, fields) {
                if (err) throw err;

                var ret = (rows[0] != null && rows[0].passwd == req.body.passwd);
                conn.end();
                cb(null, ret);
            });
        },
        fun3: ['fun1', function(cb, results){
            if (results['fun1'])
            {
                res.render('index', {title:'123', body:'abc'});
            }
            else
            {
                res.redirect('/login');
            }
        }]
    };
    async.auto(tasklist);
});

app.post('/', function(req, res){
    res.render('index', {title:'123', body:'abc'});
});

app.listen(8000);


/*
// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  // create user in req.body
})
*/
