var express = require('express');
var router = express.Router();
var db = require('../models');
var auth = require('../auth');
var timeStamp = require('../qmodules/timeStamp');

//Objects
var createCoin = (req, res) => {
    var json = req.body;
    var Coin = new db.Coin(json);
    Coin.save((err, result) => {
        if (err) {
            res.status(422);
            res.json({success: false});
         }
         else {
            res.json({success: true});
         }
    })
}
var createCoinValues = (req, res) => {
    var json = req.body;
    var Coin = db.Coin;

    Coin.findOneAndUpdate({unit: json.unit}, {$push: {values: json.values}}, (err,odoc)=> {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
             res.send('success');
        }
    })
}

var getAllCoins_NonChart = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, false);
 }

 var getCoins_NonChart = (req, res) => {
    getCoinsInRange_f(req, res, 7);
 }

 var getAllCoins_chart7days = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, true, '7days');
 }

 var getCoins_chart7days = (req, res) => {
    getCoinsInRange_f(req, res, 7, false, true, '7days');
 }


var getAllCoins = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, true);
 }

 var getCoins = (req, res) => {
    getCoinsInRange_f(req, res, 7, false, true);
 }

var getCoinsInRange = (req, res) => {
    getCoinsInRange_f(req, res, req.params.timerange, false, true);
}

var getAllCoins_NonChart_Offset = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, false, '', req.params.skip, req.params.limit);
}

var getAllCoins_chart7days_Offset = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, true, '7days', req.params.skip, req.params.limit);
}

var getAllCoins_Offset = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, true, '', req.params.skip, req.params.limit);
}


var getAllCoins_Tiny_Offset = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, false, '', req.params.skip, req.params.limit, true);
}

var getAllCoins_Tiny = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, false, '', 0, 0, true);
}

var getCoins_Tiny = (req, res) => {
    getCoinsInRange_f(req, res, 7, false, false, '', 0, 0, true);
 }




//RESTful
//POST
router.post('/', auth.Admin, createCoin);   //token admin
router.post('/values', auth.Admin, createCoinValues);   //token admin

//GET
router.get('/tiny/', getAllCoins_Tiny);
router.get('/tiny/:coinunits', getCoins_Tiny);

router.get('/nonchart/', getAllCoins_NonChart);
router.get('/nonchart/:coinunits', getCoins_NonChart);



router.get('/chart7days/', getAllCoins_chart7days);
router.get('/chart7days/:coinunits', getCoins_chart7days);

router.get('/', getAllCoins);
router.get('/:coinunits/:timerange', getCoinsInRange);
router.get('/:coinunits', getCoins);

router.get('/nonchart/offset/:skip/:limit', getAllCoins_NonChart_Offset);

router.get('/chart7days/offset/:skip/:limit', getAllCoins_chart7days_Offset);

router.get('/offset/:skip/:limit', getAllCoins_Offset);



router.get('/tiny/offset/:skip/:limit', getAllCoins_Tiny_Offset);




//PUT
router.put('/name/:unit/:name', auth.Admin, function(req, res) {  //token admin
    var name = req.params.name;
    updateCoinField(req, res, {'name': name});
})
router.put('/unit/:unit/:unitn', auth.Admin, function(req, res) {  //token admin
    var unitn = req.params.unitn;
    updateCoinField(req, res, {'unit': unitn});
})
router.put('/mineable/:unit/:mineable', auth.Admin, function(req, res) {  //token admin
    var mineable = req.params.mineable;
    updateCoinField(req, res, {'mineable': mineable});
})
router.put('/circulating/:unit/:circulating', auth.Admin, function(req, res) {  //token admin
    var circulating = req.params.circulating;
    updateCoinField(req, res, {'circulating': circulating});
})
router.put('/change/:unit/:change', auth.Admin, function(req, res) {  //token admin
    var change = req.params.change;
    updateCoinField(req, res, {'change': change});
})

//DELETE
router.delete('/:unit', auth.Admin, function(req, res) {  //token admin
    removeCoin(res, req.params.unit);
})

//Functions

function removeCoin(res, unit) {
    var Coin = db.Coin;

    Coin.remove({unit: unit}, (err) => {
        if (err) res.send(err);
        else res.send('success'); 
    })
}

function updateCoinField(req, res, data) {
    var Coin = db.Coin;

    Coin.findOneAndUpdate({unit: req.params.unit}, {$set: data}, (err,odoc)=> {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
             res.send('success');
        }
    })
}


function getCoinsInRange_f (req, res, range, all=false, chart=false, typeChart='', skip=0, limit=0, tiny=false) {
    console.time("t_all_function");
    var cunits = all===false? req.params.coinunits.split('|'): "";
    var Coin = db.Coin;
    var matchStage;
    var date = new Date();
    var pipeline = new Array();
    var projectStage = {
        $project: {
            'name': true,
            'symbol': true,
            'available_supply': true,
            'values': {
                $filter: {
                    input: '$values',
                    as: 'item',
                    cond: {$gte: ['$$item.timeStamp', (timeStamp.current()-timeStamp.day(range+1))]}
                }
            }
        }
    }
    var daysTimeStamp = [];


    if (all===false) {
        if (cunits[0]==='fbyname') {
            matchStage = {
                $match: {name: {$regex: cunits[1]}}
            };
        } else if (cunits[0]==='fbysymbol') {
            matchStage = {
                $match: {symbol: {$regex: cunits[1]}}
            };
        } else {
            matchStage = {
                $match: {symbol: {$in: cunits}}
            };
        }
        pipeline.push(matchStage);
    }
    limit = parseInt(limit);
    if (limit > 0) {
        skip = parseInt(skip);
        pipeline.push( {$skip: skip});
        pipeline.push( {$limit: limit});
    }
    pipeline.push(projectStage);
    pipeline.push( {$sort: {_id: 1}});

    //time
    console.time("mongodb");

    Coin.aggregate(pipeline, (err, coin) => {
            if (err) {
                res.status(422);
                res.json( {success: false} );
            }
            if (coin) {
                var arrayCoinsFinal = [];
                
                for (coin_index=0;coin_index<coin.length;coin_index++) {
                    var jsonValues = {};
                    var jsonFinal = {};
                    jsonValues = JSON.parse(JSON.stringify(coin[coin_index].values));
                    var coindata = coin[coin_index];

                    // var firstIndex = jsonValues.findIndex(value => {
                    //     return value.timeStamp < (timeStamp.current() - timeStamp.day(1)); 
                    // });
                    // firstIndex = firstIndex === -1? firstIndex = jsonValues.length: firstIndex;
                    var firstIndex = 1;
                    
                    var itemAll_values  = [];
                    var arrayValuesMaxFinal = {};
                    if (chart===false) {
                        firstIndex = jsonValues.length;
                        last_index = jsonValues.length - 1;

                        var change1h_Percent = parseFloat((jsonValues[last_index].price - jsonValues[last_index-1].price)*100/jsonValues[last_index].price).toFixed(2);
                        var change24h_I = jsonValues.findIndex( values => {
                            return values.timeStamp < jsonValues[last_index].timeStamp-timeStamp.day(1);
                        });
                        var change24h = change24h_I === -1? jsonValues[last_index].price: jsonValues[change24h_I].price;
                        var change24_Percent = parseFloat((jsonValues[last_index].price - change24h)*100/change24h).toFixed(2);
                        
                        itemAll_values.push( {
                            timeStamp: parseInt(jsonValues[last_index].timeStamp),
                            price: jsonValues[last_index].price,
                            marketcap: jsonValues[last_index].marketcap,
                            volume24: jsonValues[last_index].volume24,
                            change_1h: change1h_Percent,
                            change_24h: change24_Percent
                        })
                    }


                    
                    for (i=firstIndex;i<jsonValues.length;i++ ) {
                        var change1h_Percent = parseFloat((jsonValues[i].price - jsonValues[i-1].price)*100/jsonValues[i].price).toFixed(2);
                        var change24h_I = jsonValues.findIndex( values => {
                                    return values.timeStamp < jsonValues[i].timeStamp-timeStamp.day(1);
                        });
                        var change24h = change24h_I === -1? jsonValues[i].price: jsonValues[change24h_I].price;
                        var change24_Percent = parseFloat((jsonValues[i].price - change24h)*100/change24h).toFixed(2);
                        var iDate =  timeStamp.toTime(jsonValues[i].timeStamp);
                        var values = {
                            timeStamp: parseInt(jsonValues[i].timeStamp),
                            price: jsonValues[i].price,
                            marketcap: jsonValues[i].marketcap,
                            volume24: jsonValues[i].volume24,
                            change_1h: change1h_Percent,
                            change_24h: change24_Percent
                        }
                       
                        itemAll_values.push(values);
                        if (arrayValuesMaxFinal[iDate]===undefined || parseFloat(arrayValuesMaxFinal[iDate].price) < parseFloat(jsonValues[i].price)) {
                            delete values.change_1h;
                            arrayValuesMaxFinal[iDate] = values;
                        }

                    }

                    if (tiny === true) {
                        arrayCoinsFinal.push({
                            nm: coindata.name,
                            sb: coindata.symbol,
                            mc: itemAll_values[itemAll_values.length-1]['marketcap'],
                            pr: itemAll_values[itemAll_values.length-1]['price'],
                            c01: itemAll_values[itemAll_values.length-1]['change_1h'],
                            c24: itemAll_values[itemAll_values.length-1]['change_24h'],
                        })

                    } else {
                        arrayCoinsFinal.push( {
                            name: coindata.name,
                            symbol: coindata.symbol,
                            available_supply: coindata.available_supply,
                            last_values: itemAll_values[itemAll_values.length-1],
                            max7days_values: arrayValuesMaxFinal,
                            all_values: itemAll_values
                        })
                }

                    if (chart===false && tiny===false) {
                        delete arrayCoinsFinal[coin_index].all_values;
                        delete arrayCoinsFinal[coin_index].max7days_values;
                    } else {
                        switch (typeChart) {
                            case '7days': 
                                delete arrayCoinsFinal[coin_index].all_values;
                                break;
                        }
                    }
                    
                }
                jsonFinal = JSON.parse(JSON.stringify(arrayCoinsFinal));
                res.json(jsonFinal);
                }
        });
        console.timeEnd("mongodb");
        console.timeEnd("t_all_function");
}



module.exports = router;

