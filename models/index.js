var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var db = {};

mongoose.connect('mongodb://localhost:27017/cryws');
//mongoose.connect('mongodb://admin:admin@ds231529.mlab.com:31529/cryws_cloud')

db.Coin = require('./coinModel');
db.Account = require('./accountModel');

db.mongoose = mongoose;
module.exports = db;

