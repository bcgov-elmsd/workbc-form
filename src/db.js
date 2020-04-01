var MongoClient = require('mongodb').MongoClient,
    Db = require('mongodb').Db,
    Server = require('mongodb').Server

var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL || "localhost:27017",
    mongoURLLabel = "mongodb://";

let _db;




module.exports = {
    connectDB: function(callback){
        MongoClient.connect(mongoURLLabel + mongoURL, {useNewUrlParser: true, useUnifiedTopology: true} ,function(err,client){
            //console.log(client.db('test_db'));
            _db = client.db('workbcjobmatch');
            //_db.collection('employer').insertOne({b:1});
            //console.log(_db.collection('employee'))
            return callback(err);
        });
    },    
    getDB: function(){
        return _db;
    }
};