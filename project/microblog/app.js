
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var util = require('util');

var MongoStore = require('connect-mongo')(express);
var partials = require('express-partials');
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set('view options', {
//    layout: true
//});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(flash());
app.use(partials());

app.use(express.cookieParser());
app.use(express.session({
    secret:settings.cookieSecret,
    store:new MongoStore({
        db:settings.db
    })
}));
app.use(app.router);
routes(app);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/reg', routes.reg);


//app.get('/users', user.list);
//app.get('/hello', routes.hello);
//
//app.all('/user/:username', function(req, res, next){
//    //res.send('all username will captured');
//    console.log('all username will capture');
//    next();
//});
//
//app.get('/user/:username', function(req, res){
//    res.send('user:' + req.params.username);
//});
//
//
//app.get('/list', function(req, res){
//    res.render('list', {
//        title:'List',
//        items:[1991, 'jack', 'express', 'Node.js']
//    });
//});


/* express 2.x
app.helpers ({
    inspect:function(obj){
        return util.inspect(obj, true);
    }
});

app.dynamicHelpers({
    headers:function(req, res){
        return req.headers;
    }
});

app.get('/helper', function(req, res){
    res.render('helper', {
        title:'helper'
    });
});
*/
/******************************************************/
/* express 3.x
app.locals ({
    inspect:function(obj){
        return util.inspect(obj, true);
    }
});

app.set({
    headers:function(req, res){
        return req.headers;
    }
});

app.get('/helper', function(req, res){
    res.render('helper', {
        title:'helper'
    });
});

*/


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
