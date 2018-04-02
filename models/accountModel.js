var mongoose  = require("mongoose");

var Schema = mongoose.Schema;

var accountSchema = new Schema({
    username: String,
    password: String,
    rule: String,
    favorites: []
});

var Account = mongoose.model('accounts', accountSchema);

module.exports = Account;

