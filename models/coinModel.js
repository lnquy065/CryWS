var mongoose  = require("mongoose");

var Schema = mongoose.Schema;

var coinSchema = new Schema({
    name: String,
    symbol: String,
    mineable: Boolean,
    available_supply: String,
    change: Number,
    values: [
        {
                        _id: String,
                        marketcap: Number,
                        price: Number,
                        volume24: String,
                        timeStamp: Number
        }
    ]
}, {_id: false, id: false});

var Coin = mongoose.model('coins', coinSchema);

module.exports = Coin;

