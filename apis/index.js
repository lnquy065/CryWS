var express  = require('express');
var router = express.Router();
var path    = require("path");

//middleware
router.use('/api/coins', require('./coins'));
router.use('/api/tokens', require('./tokens'));
router.use('/api/accounts', require('./accounts'));

router.use('/', (req, res) => {
    res.sendFile('/views/homepage.html', {root: __dirname});
})

module.exports = router;