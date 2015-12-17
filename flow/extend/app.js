// 3rd party
var express = require('express');
var hbs = require('hbs');

var app = express();
//var router = express.Router();

var bodyParser = require('body-parser');
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var dbconfig = require('../conf/dbconfig');
var mysql = require('mysql');
 
var async = require('async');

var parseurl = require('parseurl');
var session = require('express-session');

var redis = require("redis");
var client = redis.createClient(6380, "127.0.0.1");
var hour = 20000; // 20s

var menuroot = [
    {
        "name": "一级菜单",
        "submenu": [
        {
            "name": "二级菜单",
            "url": ""
        },
        {
            "name": "二级菜单",
            "url": ""
        }
        ]
    },
    {
        "name": "一级菜单",
        "submenu": [
        {
            "name": "二级菜单",
            "url": ""
        },
        {
            "name": "二级菜单",
            "submenu": [
            {
                "name": "三级菜单",
                "submenu": [
                {
                    "name": "四级菜单",
                    "url": ""
                }
                ]
            },
            {
                "name": "三级菜单",
                "url": ""
            }
            ]
        },
        {
            "name": "二级菜单",
            "url": ""
        },
        {
            "name": "二级菜单",
            "submenu": [
            {
                "name": "三级菜单",
                "submenu": [
                {
                    "name": "四级菜单",
                    "url": ""
                },
                {
                    "name": "四级菜单",
                    "submenu": [
                    {
                        "name": "五级菜单",
                        "url": ""
                    },
                    {
                        "name": "五级菜单",
                        "url": ""
                    }
                    ]
                }
                ]
            },
            {
                "name": "三级菜单",
                "url": ""
            }
            ]
        },
        {
            "name": "二级菜单",
            "url": ""
        }
        ]
    },
    {
        "name": "一级菜单",
        "submenu": [
        {
            "name": "二级菜单",
            "url": ""
        },
        {
            "name": "二级菜单",
            "url": ""
        },
        {
            "name": "百度",
            "url": "http://www.baidu.com"
        }
        ]
    }
];

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    var views = req.session.views;
    /* update client cookie expire time */
    req.session.cookie.expires = new Date(Date.now() + hour);
    req.session.cookie.maxAge = hour;
    /* update redis key expire time */
    client.send_command("expire", [req.session.id, 20], function(err, reply) {
        if (reply == null)
            console.log("update session expire time failed");
    });

    if (!views) {
        views = req.session.views = {};
    }

    // get the url pathname
    var pathname = parseurl(req).pathname;

    // count the views
    views[pathname] = (views[pathname] || 0) + 1;

    next();
});

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
/* set resource root directory */
app.use(express.static(__dirname + '/public'));

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
    res.render('login', {title:'123', body:'abc'});
});

app.post('/login', urlencodedParser, function(req, res){
    /* connect directly */
    var conn = mysql.createConnection(dbconfig.mysql);
    conn.connect();

    var tasklist = {
        fun1: function(cb, results){
            /* query user from mysql */
            //conn.query('select * from corp_user where corpid=100001 and username=\"admin\" and passwd=password(\"mdos\")', function(err, rows, fields) {
            conn.query('SELECT * from corp_user where username=\'' + req.body.uname + '\' and passwd=password(\'' + req.body.passwd + '\')', function(err, rows, fields) {
            //conn.query('SELECT * from customer where name=\'' + req.body.uname + '\'', function(err, rows, fields) {
                conn.end();
                if (err) throw err;

                var ret = (rows[0] != null);

                cb(null, ret);
            });
        },
        fun3: ['fun1', function(cb, results){
            if (results['fun1'])
            {
                /* insert session id in redis */
                client.send_command("set", [req.session.id, "1"], function(err, reply) {
                    if (reply != null)
                        console.log(reply.toString());
                });
                client.send_command("expire", [req.session.id, 20], function(err, reply) {
                    if (reply != null)
                        console.log(reply.toString());
                });

                /* jump to index page */
                //res.render('index', {title:'123', body:'abc'});
                res.redirect('/?name=' + req.body.uname);
            }
            else /* query user failed */
            {
                res.redirect('/login');
            }
        }]
    };
    async.auto(tasklist);
});
/*
app.post('/', function(req, res){
    console.log("post /");
    res.render('index', {title:'123', body:'abc'});
});
*/

app.get('/', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            res.render('index', {menu: JSON.stringify(menuroot), title:'123', body:'abc'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.listen(8000);

/*
// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  // create user in req.body
})
*/
