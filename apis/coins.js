var express = require('express');
var router = express.Router();
var db = require('../models');
var auth = require('../auth');
var timeStamp = require('../qmodules/timeStamp');
var bmpEncode = require('../qmodules/bmpEncode');

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
          //  console.error(err);
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

var getAllCoins_TinyIcon_Offset = (req, res) => {
    getCoinsInRange_f(req, res, 7, true, false, '', req.params.skip, req.params.limit, true, true);
}

var getAllCoins_Tiny = (req, res) => {
    
    getCoinsInRange_f(req, res, 7, true, false, '', 0, 0, true);
}

var getCoins_Tiny = (req, res) => {
    getCoinsInRange_f(req, res, 7, false, false, '', 0, 0, true);
 }
 var getCoins_Tiny_Chart7days = (req, res) =>{
    getCoinsInRange_f(req, res, 7, false, true, '7days', 0,0, true, true);
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

router.get('/tiny/chart7days/:coinunits', getCoins_Tiny_Chart7days);


router.get('/chart7days/', getAllCoins_chart7days);
router.get('/chart7days/:coinunits', getCoins_chart7days);

router.get('/', getAllCoins);
router.get('/:coinunits/:timerange', getCoinsInRange);
router.get('/:coinunits', getCoins);

router.get('/nonchart/offset/:skip/:limit', getAllCoins_NonChart_Offset);

router.get('/chart7days/offset/:skip/:limit', getAllCoins_chart7days_Offset);

router.get('/offset/:skip/:limit', getAllCoins_Offset);



router.get('/tiny/offset/:skip/:limit', getAllCoins_Tiny_Offset);

router.get('/tiny/icon/offset/:skip/:limit', getAllCoins_TinyIcon_Offset);



//PUT
router.put('/name/:unit/:name', auth.Admin, function(req, res) {  //token admin
    var name = req.params.name;
    updateCoinField(req, res, {'name': name});
})
router.put('/symbol/:unit/:unitn', auth.Admin, function(req, res) {  //token admin
    var unitn = req.params.unitn;
    updateCoinField(req, res, {'symbol': unitn});
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

    Coin.findOneAndUpdate({symbol: req.params.unit}, {$set: data}, (err,odoc)=> {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
             res.send('success');
        }
    })
}


function mapChart(v, max1, min1, max2, min2) {
    var ratio = (max1 - min1)/(max2 - min2);
    
    return parseInt((v - min1) / ratio);
}




function getCoinsInRange_f (req, res, range, all=false, chart=false, typeChart='', skip=0, limit=0, tiny=false, icon=false) {
    var cunits = all===false? req.params.coinunits.split('|'): "";  //get coins array that splited from req.
    var Coin = db.Coin;
    var matchStage;
    var date = new Date();


    //built Aggregation PipeLine
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
                    cond: {$gte: ['$$item.timeStamp', ((timeStamp.current()+timeStamp.hour(7) )-timeStamp.day(range+1))]}    //get values 8days ago
                }
            }
        }
    }
    if (all===false) {
        if (cunits[0]==='fbyname') {
            matchStage = {
                $match: {name: {$regex: cunits[1], $options: 'i'}}
            };
        } else if (cunits[0]==='fbysymbol') {
            matchStage = {
                $match: {symbol: {$regex: cunits[1], $options: 'i'}}
            };
        } else {
            matchStage = {
                $match: {symbol: {$in: cunits}}
            };
        }
        pipeline.push(matchStage);
    }
    pipeline.push( {$sort: {_id: 1}});
    limit = parseInt(limit);
    if (limit > 0) {
        skip = parseInt(skip);
        pipeline.push( {$skip: skip});
        pipeline.push( {$limit: limit});
    }
    pipeline.push(projectStage);
    

    //Run Mongodb
    Coin.aggregate(pipeline, (err, coin) => {
            if (err) {
                res.status(404);
                res.json( {success: false} );
            }
            if (coin) {
                var arrayCoinsFinal = [];
                
                //Duyet danh sach tung Coin
                for (coin_index=0;coin_index<coin.length;coin_index++) {
                  
                     if (coin[coin_index].values.length < 10) continue;
                    var jsonValues = {};
                    var jsonFinal = {};
                    jsonValues = JSON.parse(JSON.stringify(coin[coin_index].values));
                    var coindata = coin[coin_index];

                    // var firstIndex = jsonValues.findIndex(value => {
                    //     return value.timeStamp < (timeStamp.current() - timeStamp.day(1)); 
                    // });
                    // firstIndex = firstIndex === -1? firstIndex = jsonValues.length: firstIndex;
                    var firstIndex = 1;
                    
                    var hourlyValues_pre  = [];
                    var max7daysChartValue_pre = {};
                    var max7daysChart_final = {};

                    var max7Day = 0;
                    var min7Day = 999999;
                    
                    //Nonchart -> ko lấy dữ liệu hằng giờ chỉ lấy dữ liệu cuối
                    if (chart===false) { //-> Lấy dữ liệu cuối
                        
                        firstIndex = jsonValues.length;
                        last_index = jsonValues.length - 1;
 
                        if (jsonValues[last_index] === undefined) {
                           // console.log("next");
                            continue;
                        }
                       
                        var change1h_Percent = parseFloat((jsonValues[last_index].price - jsonValues[last_index-1].price)*100/jsonValues[last_index].price).toFixed(2);
                        var change24h_I = jsonValues.findIndex( values => {
                           
                            return values.timeStamp > jsonValues[last_index].timeStamp-timeStamp.day(1);
                        })-1;
                        var change24h = change24h_I < 0? jsonValues[last_index].price: jsonValues[change24h_I].price;
                        var change24_Percent = parseFloat((jsonValues[last_index].price - change24h)*100/change24h).toFixed(2);
                        
                        hourlyValues_pre.push( {
                            timeStamp: parseInt(jsonValues[last_index].timeStamp),
                            price: jsonValues[last_index].price,
                            marketcap: jsonValues[last_index].marketcap,
                            volume24: jsonValues[last_index].volume24,
                            change_1h: change1h_Percent,
                            change_24h: change24_Percent
                        })
                    }

                    //Duyệt dữ liệu hằng giờ
                    for (i=firstIndex;i<jsonValues.length;i++ ) {
                        var change1h_Percent = parseFloat((jsonValues[i].price - jsonValues[i-1].price)*100/jsonValues[i].price).toFixed(2);
                        var change24h_I = jsonValues.findIndex( values => {
                                    return values.timeStamp > jsonValues[i].timeStamp-timeStamp.day(1);
                        })-1;
                        var change24h = change24h_I < 0? jsonValues[i].price: jsonValues[change24h_I].price;
                        var change24_Percent = parseFloat((jsonValues[i].price - change24h)*100/change24h).toFixed(2);
                        var iDate =  timeStamp.toPrev(timeStamp.toDate(jsonValues[i].timeStamp));

                        //values: Thêm dữ liệu từng giờ vào mảng hourly
                        var values = {
                            timeStamp: parseInt(jsonValues[i].timeStamp),
                            price: jsonValues[i].price,
                            marketcap: jsonValues[i].marketcap,
                            volume24: jsonValues[i].volume24,
                            change_1h: change1h_Percent,
                            change_24h: change24_Percent
                        }
                        hourlyValues_pre.push(values);

                        //Nếu lấy dữ liệu 7 ngày -> Tìm max mỗi ngày lưu vào max7daysChartValue_pre
                        if (typeChart==='7days') {
                            max7daysChartValue_pre["prev0"] = values;
                            if  ((max7daysChartValue_pre[iDate]===undefined || parseFloat(max7daysChartValue_pre[iDate].price) < parseFloat(jsonValues[i].price))) {
                                max7daysChartValue_pre[iDate] = values;
                            }
                      
                        }
                    }

                    // if (typeChart==='7days') {
                    //     max7daysChartValue_pre["prev0"] = max7daysChartValue_pre["prev2"];
                    // }

                    //Dịnh dạng thông tin cho JSON
                    if (tiny === true) {    //-> Nếu định dạng rút gọn
                        //Định dạng ban đầu
                        var tnItem = {
                            nm: coindata.name,
                            sb: coindata.symbol,
                            mc: hourlyValues_pre[hourlyValues_pre.length-1]['marketcap'],
                            pr: hourlyValues_pre[hourlyValues_pre.length-1]['price'],
                            c01: hourlyValues_pre[hourlyValues_pre.length-1]['change_1h'],
                            c24: hourlyValues_pre[hourlyValues_pre.length-1]['change_24h'],
                        }
                        
                        //Thêm bitmap nếu cần
                        if ( icon===true) {
                            var img = [];
                            img = bmpEncode(coindata.symbol);
                            tnItem.ic = img;
                        }

                        //Thêm dữ liệu 7 ngày
                        if (typeChart==='7days') tnItem.max7days_values = max7daysChartValue_pre;
                        arrayCoinsFinal.push(tnItem);
                    } else {    //-> Định dạng đầy đủ nghĩa
                        arrayCoinsFinal.push( {
                            name: coindata.name,
                            symbol: coindata.symbol,
                            available_supply: coindata.available_supply,
                            last_values: hourlyValues_pre[hourlyValues_pre.length-1],
                            max7days_values: max7daysChartValue_pre,
                            all_values: hourlyValues_pre
                        })
                    }


                   //Định dạng dữ liệu JSON cuối cùng (Thêm, chỉnh sủa, xóa item thừa)
                    if (chart===false && tiny===false) {        // coins/nonchart
                        //Xóa hourly, max7day
                        if (arrayCoinsFinal[coin_index]!== undefined) {
                            delete arrayCoinsFinal[coin_index].all_values;
                            delete arrayCoinsFinal[coin_index].max7days_values;
                        }
                    } else if (chart===true && tiny===true) {  // tinychart7days
                     
                        if (typeChart==='7days') {
                            delete arrayCoinsFinal[coin_index].mc;
                            delete arrayCoinsFinal[coin_index].c01;
                            delete arrayCoinsFinal[coin_index].c24;
                            console.log(arrayCoinsFinal[coin_index].max7days_values);
                            console.log(max7Day+' '+min7Day);

                            arrayCoinsFinal[coin_index].max7days_values.prev0.price =  arrayCoinsFinal[coin_index].max7days_values.prev2.price;
                            

                            var mChart_tmp = [arrayCoinsFinal[coin_index].max7days_values.prev7.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev6.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev5.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev4.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev3.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev2.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev1.price,
                            arrayCoinsFinal[coin_index].max7days_values.prev0.price];


                            max7Day = Math.max(...mChart_tmp);
                            min7Day = Math.min(...mChart_tmp);

                            var mChart = [];
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev7.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev6.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev5.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev4.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev3.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev2.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev1.price, max7Day, min7Day, 48, 0));
                            mChart.push(mapChart(arrayCoinsFinal[coin_index].max7days_values.prev0.price, max7Day, min7Day, 48, 0));
                            delete arrayCoinsFinal[coin_index].max7days_values; 
                            arrayCoinsFinal[coin_index].c7 = mChart;
                        }
                    } else { //chart7day
                        switch (typeChart) {
                            case '7days': 
                              //  console.log(arrayCoinsFinal[coin_index]);
                              if (arrayCoinsFinal[coin_index] !== undefined) {
                                  delete arrayCoinsFinal[coin_index].max7days_values.prev8;
                                delete arrayCoinsFinal[coin_index].last_values;
                                delete arrayCoinsFinal[coin_index].all_values;
                              }
                                break;
                        }
                    }
                    
                }
                jsonFinal = JSON.parse(JSON.stringify(arrayCoinsFinal));
                if (arrayCoinsFinal.length === 0) res.status(404);
                res.json(jsonFinal);
                }
        });
       // console.timeEnd("mongodb");
       // console.timeEnd("t_all_function");
}



module.exports = router;

