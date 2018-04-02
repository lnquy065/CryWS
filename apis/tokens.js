var express = require('express');
var router = express.Router();
var db = require('../models');
var auth = require('../auth');

//Objects
var createToken = (req, res) => {
    var json = req.body;
    var Token = new db.Token(json);
    Token.save((err, result) => {
        if (err) {
            res.status(422);
            res.json({success: false});
         }
         else {
            res.json({success: true});
         }
    })
}
var createTokenValues = (req, res) => {
    var json = req.body;
    var Token = db.Token;

    Token.findOneAndUpdate({unit: json.unit}, {$push: {values: json.values}}, (err,odoc)=> {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
             res.send('success');
        }
    })
}
var getTokens = (req, res) => {
    var range =  7;
    var cunits = req.params.tokenunits.split('|');
    var Token = db.Token;
    var matchStage;
    var date = new Date();
    var pipeline = new Array();
    var projectStage = {
        $project: {
            'name': true,
            'unit': true,
            'platform': true,
            'platformunit': true,
            'circulating': true,
            'change': true,
            'values': {
                $filter: {
                    input: '$values',
                    as: 'item',
                    cond: {$gte: ['$$item.dateTime', date]}
                }
            }
        }
    }

    date.setDate(date.getDate()-range);
    
    if (cunits[0].toLowerCase()==='alltokens') {
    } else{
        matchStage = {
            $match: {unit: {$in: cunits}}
        };
        pipeline.push(matchStage);
    }


    pipeline.push(projectStage);
    Token.aggregate(pipeline, (err, coin) => {
            if (err) {
                res.status(422);
                res.json({success: false})
            }
            if (coin) {
                res.send(JSON.parse(JSON.stringify(coin)));
            }
        });
}

var getTokensInRange = (req, res) => {
    var range =  req.params.timerange;
    var cunits = req.params.tokenunits.split('|');
    var Token = db.Token;
    var matchStage;
    var date = new Date();
    var pipeline = new Array();
    var projectStage = {
        $project: {
            'name': true,
            'unit': true,
            'platform': true,
            'platformunit': true,
            'circulating': true,
            'change': true,
            'values': {
                $filter: {
                    input: '$values',
                    as: 'item',
                    cond: {$gte: ['$$item.dateTime', date]}
                }
            }
        }
    }

    date.setDate(date.getDate()-range);
    console.log(date);
    
    if (cunits[0].toLowerCase()==='alltokens') {
    } else{
        matchStage = {
            $match: {unit: {$in: cunits}}
        };
        pipeline.push(matchStage);
    }


    pipeline.push(projectStage);
    Token.aggregate(pipeline, (err, coin) => {
            if (err) {
                res.status(422);
                res.json( {success: false} );
            }
            if (coin) {
                res.send(JSON.parse(JSON.stringify(coin)));
            }
        });
}


//RESTful
//POST
router.post('/', auth.Admin, createToken);   //token admin
router.post('/values', auth.Admin, createTokenValues);   //token admin

//GET
router.get('/:tokenunits/:timerange', getTokensInRange);
router.get('/:tokenunits', getTokens);

//PUT
router.put('/name/:unit/:name', auth.Admin, function(req, res) {  //token admin
    var name = req.params.name;
    updateTokenFields(req, res, {'name': name});
})
router.put('/unit/:unit/:unitn', auth.Admin, function(req, res) {  //token admin
    var unitn = req.params.unitn;
    updateTokenFields(req, res, {'unit': unitn});
})
router.put('/platform/:unit/:platform', auth.Admin, function(req, res) {  //token admin
    var platform = req.params.platform;
    updateTokenFields(req, res, {'platform': platform});
})
router.put('/platformunit/:unit/:platformunit', auth.Admin, function(req, res) {  //token admin
    var platformunit = req.params.platformunit;
    updateTokenFields(req, res, {'platformunit': platformunit});
})
router.put('/circulating/:unit/:circulating', auth.Admin, function(req, res) {  //token admin
    var circulating = req.params.circulating;
    updateTokenFields(req, res, {'circulating': circulating});
})
router.put('/change/:unit/:change', auth.Admin, function(req, res) {  //token admin
    var change = req.params.change;
    updateTokenFields(req, res, {'change': change});
})

//DELETE
router.delete('/:unit', auth.Admin, function(req, res) {  //token admin
    removeToken(res, req.params.unit);
})

//Functions

function removeToken(res, unit) {
    var Token = db.Token;

    Token.remove({unit: unit}, (err) => {
        if (err) res.send(err);
        else res.send('success'); 
    })
}

function updateTokenFields(req, res, data) {
    var Token = db.Token;

    Token.findOneAndUpdate({unit: req.params.unit}, {$set: data}, (err,odoc)=> {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
             res.send('success');
        }
    })
}



module.exports = router;

