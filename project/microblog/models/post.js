/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 14-1-5
 * Time: 上午1:03
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db');

function Post(username, post, time){
    this.user = username;
    this.post = post;

    if(time){
        this.time = time;
    }else{
        this.time = new Date();
    }
};

module.exports = Post;

Post.prototype.save = function save(callback){

    var post = {
        user:this.user,
        post:this.post,
        time:this.time
    };

    mongodb.open(function(err, db){

        if(err){
            return callback(err);
        }

        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //为 user 属性添加索引
            collection.ensureIndex('user');

            //写入 post 文档
            collection.insert(post, {safe:true}, function(err, post){
                mongodb.close();
                callback(err);
            });
        });
    });
};

Post.get = function get(username, callback){

    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }

        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            var query = {};
            if(username){
                query.user = username;
            }

//            collection.find(query).sort({time:-1}).toArray(function(err,docs){
//                mongodb.close();
//                if(err){
//                    callback(err);
//                }
//
//                var posts = {};
//                docs.forEach(function(doc, index){
//                    var post = new Post(doc.user, doc.post, doc.time);
//                    posts.push(post);
//                });
//                callback(null, posts);
//            });
            collection.find(query, {limit:9}).sort({time: -1}).toArray(function(err, docs) {
                mongodb.close();

                if (err) {
                    callback(err, null);
                }

                var posts = [];

                docs.forEach(function(doc, index) {
                    var post = new Post(doc.user, doc.post, doc.time);
                    posts.push(post);
                });

                callback(null, posts);
            });
        });
    });
};