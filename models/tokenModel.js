var mongoose  = require("mongoose");

var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    name: String,
    unit: String,
    platform: String,
    platformunit: String,
    circulating: Number,
    change: Number,
    values: [
        {
        marketcap: Number,
        price: Number,
        volume24: Number,
        dateTime: Date
        }
    ]
});

var Token = mongoose.model('tokens', tokenSchema);

module.exports = Token;

