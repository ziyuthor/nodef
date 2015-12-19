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
        "name": "信息管理",
        "submenu": [
        {
            "name": "系统信息",
            "url": "/systemInfo"
        },
        {
            "name": "账户信息",
            "url": "/accountInfo"
        }
        ]
    },
    {
        "name": "流量充值",
        "submenu": [
        {
            "name": "单个充值",
            "url": "/charge"
        },
        {
            "name": "批量充值",
            "url": "/multiCharge"
        }
        ]
    },
    {
        "name": "任务管理",
        "submenu": [
        {
            "name": "订单查询",
            "url": "/queryOrder"
        }
        ]
    },
    {
        "name": "企业管理",
        "submenu": [
        {
            "name": "企业查询",
            "url": "/queryCrop"
        },
        {
            "name": "新建企业信息",
            "url": "/addCrop"
        },
        {
            "name": "企业信息修改",
            "url": "/modifyCrop"
        }
        ]
    },
    {
        "name": "产品管理",
        "submenu": [
        {
            "name": "产品信息",
            "url": "/product"
        },
        {
            "name": "产品添加",
            "url": "/addProduct"
        },
        {
            "name": "产品调整",
            "url": "/modifyProduct"
        }
        ]
    },
    {
        "name": "流量包管理",
        "submenu": [
        {
            "name": "流量包查询",
            "url": "/queryPackage"
        },
        {
            "name": "新增流量包",
            "url": "/addPackage"
        },
        {
            "name": "流量包调整",
            "url": "/modifyPackage"
        }
        ]
    },
    {
        "name": "通道管理",
        "submenu": [
        {
            "name": "通道查询",
            "url": "/queryChannel"
        },
        {
            "name": "新增通道",
            "url": "/addChannel"
        },
        {
            "name": "通道调整",
            "url": "/modifyChannel"
        }
        ]
    },
    {
        "name": "用户管理",
        "submenu": [
        {
            "name": "用户查询",
            "url": "/queryUser"
        },
        {
            "name": "添加用户",
            "url": "/addUser"
        },
        {
            "name": "删除用户",
            "url": "/deleteUser"
        }
        ]
    }
];

var menuadmin = [
    {
        "name": "信息管理",
        "submenu": [
        {
            "name": "系统信息",
            "url": "/systemInfo"
        },
        {
            "name": "账户信息",
            "url": "/accountInfo"
        }
        ]
    },
    {
        "name": "流量充值",
        "submenu": [
        {
            "name": "单个充值",
            "url": "/charge"
        },
        {
            "name": "批量充值",
            "url": "/multiCharge"
        }
        ]
    },
    {
        "name": "任务管理",
        "submenu": [
        {
            "name": "订单查询",
            "url": "/queryOrder"
        }
        ]
    },
    {
        "name": "用户管理",
        "submenu": [
        {
            "name": "用户查询",
            "url": "/queryUser"
        },
        {
            "name": "添加用户",
            "url": "/addUser"
        },
        {
            "name": "删除用户",
            "url": "/deleteUser"
        }
        ]
    }
];

var menugeneral = [
    {
        "name": "信息管理",
        "submenu": [
        {
            "name": "系统信息",
            "url": "/systemInfo"
        },
        {
            "name": "账户信息",
            "url": "/accountInfo"
        }
        ]
    },
    {
        "name": "流量充值",
        "submenu": [
        {
            "name": "单个充值",
            "url": "/charge"
        },
        {
            "name": "批量充值",
            "url": "/multiCharge"
        }
        ]
    },
    {
        "name": "任务管理",
        "submenu": [
        {
            "name": "订单查询",
            "url": "/queryOrder"
        }
        ]
    },
    {
        "name": "用户管理",
        "submenu": [
        {
            "name": "用户查询",
            "url": "/queryUser"
        },
        {
            "name": "添加用户",
            "url": "/addUser"
        },
        {
            "name": "删除用户",
            "url": "/deleteUser"
        }
        ]
    }
];

var menuTable = [menuroot, menuadmin, menugeneral];

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
            conn.query('SELECT * from corp_user where username=\'' + req.body.uname + '\' and passwd=password(\'' + req.body.passwd + '\')', function(err, rows, fields) {
                conn.end();
                if (err) throw err;

                cb(null, (rows[0] != null) ? rows[0].privilege : null);
            });
        },
        fun3: ['fun1', function(cb, results){
            var privilege = results['fun1'];
            if (privilege != null)
            {
                /* insert session id in redis */
                client.send_command("set", [req.session.id, privilege], function(err, reply) {
                    if (reply != null)
                        console.log(reply.toString());
                });
                client.send_command("expire", [req.session.id, 20], function(err, reply) {
                    if (reply != null)
                        console.log(reply.toString());
                });

                /* jump to index page */
                //res.render('index', {title:'123', body:'abc'});
                res.redirect('/systemInfo?name=' + req.body.uname);
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
            console.log(reply);
            res.render('index', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'abc'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/systemInfo', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('systemInfo', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'systemInfo'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/accountInfo', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('accountInfo', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'accountInfo'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/charge', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('charge', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'charge'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/multiCharge', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('multiCharge', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'multiCharge'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/queryOrder', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('queryOrder', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'queryOrder'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/queryCrop', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('queryCrop', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'queryCrop'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/addCrop', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('addCrop', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'addCrop'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/modifyCrop', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('modifyCrop', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'modifyCrop'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/product', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('product', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'product'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/addProduct', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('addProduct', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'addProduct'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/modifyProduct', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('modifyProduct', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'modifyProduct'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/queryPackage', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('queryPackage', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'queryPackage'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/addPackage', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('addPackage', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'addPackage'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/modifyPackage', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('modifyPackage', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'modifyPackage'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/queryChannel', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('queryChannel', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'queryChannel'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/addChannel', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('addChannel', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'addChannel'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/modifyChannel', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('modifyChannel', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'modifyChannel'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/queryUser', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('queryUser', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'queryUser'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/addUser', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('addUser', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'addUser'});
        }
        else
        {
            res.redirect('/login');
        }
    });
});

app.get('/deleteUser', function(req, res){
    /* check the session id by redis key */
    client.get(req.session.id, function(err, reply) {
        if (reply != null) {
            console.log(reply);
            res.render('deleteUser', {menu: JSON.stringify(menuTable[reply]), title:'123', body:'deleteUser'});
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
