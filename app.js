var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var router = require('./apis'); //apis

var compression = require('compression');

//server init
var app = express();



//middleware    
app.use(compression());
    //--body-parser: xu ly json, text, ma hoa url
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true}));

    //--morgan: ghi log http request
app.use(morgan('dev'));

    //--public resource
app.use('/res/homepage', express.static('res/homepage'));
app.use('/res/coins_high', express.static('res/coins_high'));

    //--routing: dinh tuyen
app.use('/', router);


//start server
app.listen((process.env.PORT || 3000), () => console.log("Server is running"));


var cron = require('cron');
var request = require('request');
var coinChecker = require('./botsettings/coinChecker');
var db = require('./models');
var url = 'https://api.coinmarketcap.com/v1/ticker/?limit=0';
var jsonCoins, jsonTokens;
//---------------
console.log('Cronjob is running');

var getDataJob = new cron.CronJob('00 59 * * * *', function() {
    getData();
}, function() {
    console.log('job has stop');
}, true);

//  getData();


//----------------
function getData() {
request.get({
    url: url,
    json: true
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
    jsonAll = JSON.parse(JSON.stringify(data));
    var coinObj = [];
    var tokenObj = [];
      for (key=0; key< jsonAll.length; key++) {
        if (jsonAll.hasOwnProperty(key)) {


            if (coinChecker.Coin(jsonAll[key].id)) {
                coinObj.push(jsonAll[key]);
            }
            if (coinChecker.Token(jsonAll[key].id)) {
                tokenObj.push(jsonAll[key]);
            }

        }
    }
    jsonCoins = JSON.parse(JSON.stringify(coinObj));
    jsonTokens = JSON.parse(JSON.stringify(tokenObj));

    for (i=0; i< jsonCoins.length;i++) {
         updateItemDB(jsonCoins[i]);
         console.log('Update '+(i+1)+'/'+jsonCoins.length);
    }
    
    }
});
}


function updateItemDB(jObj) {
    var Coin = db.Coin;
    // var date = new Date(jObj.last_updated*1000).toISOString().replace('-', '/').split('T')[0].replace('-', '/');

    Coin.findOneAndUpdate({symbol: jObj.symbol, name: jObj.name}, {
        $set: {
            available_supply: jObj.available_supply
        },
                    $addToSet: {
                        values: {
                            _id: jObj.last_updated,
                            marketcap: parseFloat(jObj.market_cap_usd),
                            price: parseFloat(jObj.price_usd),
                            volume24: jObj['24h_volume_usd'],
                            timeStamp: jObj.last_updated
                        }
                    }
    }, (err, doc)=> {
        // if (err) console.error(err);
        // console.log(doc);
    })
}
