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
                        marketcap: String,
                        price: String,
                        volume24: String,
                        timeStamp: String
        }
    ]
}, {_id: false, id: false});

var Coin = mongoose.model('coins', coinSchema);

module.exports = Coin;

