var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jwt-simple');

var auth = require('../auth');

var getInformation = (req, res) => {
    var username = req.user.username;
    var Account = db.Account;
    if (username!==req.user.username && req.user.rule!=='admin') {
        res.status(401);
        res.json({success: false});
    } else {

    Account.findOne({username: username}, function(err, acc) {
        if (err) {
            res.status(422);
            res.json({success: false});
        } else {
            res.send(JSON.parse(JSON.stringify(acc)));
        }
    })
    }
}

var getFavorites = (req, res) => {
    var username = req.user.username;
    var Account = db.Account;
    console.log(username);
    if (username!==req.user.username) {
        res.status(401);
        res.json({success: false});
    } else {

    Account.findOne({username: username}, function(err, acc) {
        if (err) {
            res.status(422);
            res.json({success: false});
        } else {
            var json = JSON.parse(JSON.stringify(acc));
            // delete json.username;
            // delete json.password;
            // delete json.rule;
            // delete json._id;
            res.send(json);
        }
    })
    }
}

var createFavorite = (req, res) => {
    var json = req.body;
    var username = req.user.username;
    var unit  = json.favorites;
    var Account = db.Account;
    if (username!==req.user.username) {
        res.status(401);
        res.json({success: false});
    } else {

    Account.findOneAndUpdate({username: username},
         {$addToSet: {favorites: {$each: unit}}}, function(err, odoc) {
             if (err) {
                res.status(422);
                res.json({success: false});
             }
             else {
                res.json({success: true});
             }
         });
    }
}

var createAccount = (req, res) => {
    var json = req.body;
    var Account = db.Account;
    var addNew = false;

    Account.update({username: json.username}, {}, {upsert: true}, (err, docs) => {
        console.log(docs);
        if (docs.upserted===undefined) {
            res.status(422);
            res.json( {success: false, message: 'username already exists', errcode: 'RGE01'});
        } else {
            Account.update( {username: json.username},{ 
                $set: {
                    password: json.password,
                    rule: json.rule,
                    favorites: []
                }}, {upsert: true}, (err, stt) => {
                    res.status(401);
                    res.json({success: true});
                });
        }
        res.status(402);
            res.json( {success: true});
    })
    if (addNew) {
        console.log('addnew');
        
    }
    
}

var deleteAccount = (req, res) => {
    var username = req.params.username;
    var Account = db.Account;
    if (req.user.rule!=='admin') {
        res.status(401);
        res.json({success: false});
    } else {

    Account.delete({username: username}, (err) => {
        if (err) {
            res.status(422);
            res.json({success: false});
         }
         else {
            res.json({success: true});
         }
    })
    }
}

var deleteFavorites = (req, res) => {
    var favList = req.params.favorites.split('|');
    var username = req.user.username;
    var Account  = db.Account;
    if (username!==req.user.username) {
        res.status(401);
        res.json({success: false});
    } else {

    Account.update({username: username}, {$pull: {favorites: {$in: favList}}}, (err) => {
        if (err) {
            res.status(401);
            res.json({success: false});
         }
         else {
            res.json({success: true});
         }
    });
    }
}

function updateField(req, res, data) {
    var username = req.user.username;
    var Account = db.Account;
    if (username!==req.user.username) {
        res.status(401);
        return;
    }

    Account.update({username: username}, {$set: data}, (err) => {
        if (err) {
            res.status(422);
            res.json({success: false});
         }
         else {
            res.json({success: true});
         }
    })
}

var loginToServer = (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var Account = db.Account;

    Account.findOne( {username: username}, (err, acc) => {
        if (!acc) {
            res.status(422);
            res.json( {success: false, message: 'notfound', errcode: 'LGE01'});
        } else {
            if (password!==acc.password) {
                res.status(422);
                res.json( {success: false, message: 'wrongpassword', errcode: 'LGE02'});
            } else {
                //dang nhap thanh cong
                var payload = {username: acc.username, rule: acc.rule};
                var token_access = jwt.encode(payload, 'cryws');
                res.json( {success: true, token: 'JWT '+token_access});
            }
        }
    })
}

//RESTful
router.post('/favorites', auth.Both, createFavorite);  //token
router.post('/', createAccount);
router.post('/login', loginToServer);   

router.get('/', auth.Both, getInformation); //token
router.get('/favorites/', auth.Both, getFavorites); //token

router.put('/password/:new', auth.Both, function(req, res) { //token
    updateField(req, res, {'password': req.params.new});
})

router.delete('/:username', auth.Admin, deleteAccount); //token admin
router.delete('/favorites/:favorites',auth.Both, deleteFavorites); //token

module.exports = router;