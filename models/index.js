var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var db = {};

mongoose.connect('mongodb://localhost:27017/cryws');

db.Coin = require('./coinModel');
db.Account = require('./accountModel');

db.mongoose = mongoose;
module.exports = db;

