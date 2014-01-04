
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
//exports.index = function(req, res){
//  res.render('index', { title: 'Express' });
//};
//
//exports.reg = function(req, res){
//    res.render('reg',{title:'reg'});
//};
//
//exports.hello = function(req, res){
//    res.send('The time is ' + new Date().toDateString());
//}

module.exports =  function(app){

    app.get('/', function(req, res){

        Post.get(null, function(err, posts){
            if(err){
                posts = [];
            }
            res.render('index', {
                title:'首页',
                user:req.session.user,
                posts:posts,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });

    app.get('/reg',checkNotLogin);
    app.get('/reg', function(req, res){
        res.render('reg',{
            title:'用户注册',
            user:req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });

    app.get('/reg',checkNotLogin);
    app.post('/reg', function(req, res){
        //检查两次输入的口令是否一致
        if(req.body['password-repeat'] != req.body['password']){
            req.flash('error','两次输入的密码不一致');
            return res.rediret('/reg');
        }

        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = new User({
            name:req.body.username,
            password:password
        });

        User.get(newUser.name, function(err, user){

            if(user)
                err = 'Username already exists';

            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }

            newUser.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }

                req.session.user = newUser;
                req.flash('success', '注册成功');
                res.redirect('/');
            });
        });
    });

    app.get('/login',checkNotLogin);
    app.get('/login', function(req, res){
        res.render('login',{
            title:'用户登入',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });

    app.get('/login',checkNotLogin);
    app.post('/login', function(req, res){

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.get(req.body.username, function(err, user){
            if(!user){
                req.flash('error', 'user donnnt exist');
                return res.redirect('/login');
            }

            if(user.password !== password){
                req.flash('error','the password is error');
                return res.redirect('/login');
            }

            req.session.user = user;
            req.flash('success','login success');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success', 'logout success');
        res.redirect('/');
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res){
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }

            req.flash('success','post ok');
            res.redirect('/u/' + currentUser.name);
        });
    });

    app.get('/u/:user', function(req, res){
        User.get(req.params.user, function(err, user){
            if(!user){
                req.flash('error','user not exist');
                return res.redirect('/');
            }

            Post.get(user.name, function(err, posts){
                if(err){
                    req.flash('error', err);
                    res.redirect('/');
                }

                res.render('user',{
                    title:user.name,
                    posts:posts,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });

};

function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash('error', 'not login');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next){
    if(req.session.user){
        req.flash('error','has login');
        return res.redirect('/');
    }
    next();
}