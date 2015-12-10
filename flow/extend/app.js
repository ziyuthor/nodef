// 3rd party
var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json({limit: '1mb'}));  //这里指定参数使用 json 格式
app.use(bodyParser.urlencoded({
  extended: true
}));

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
app.post('/login', function(req, res){
    console.log(req.body);

    if (req.body != null)
    {
        res.render('index', {title:'123', body:'abc'});
    }
    else
    {
        
    }
});

app.post('/', function(req, res){
    res.render('index', {title:'123', body:'abc'});
});

app.listen(8000);



