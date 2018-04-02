var express  = require('express');
var router = express.Router();

//middleware
router.use('/api/coins', require('./coins'));
router.use('/api/tokens', require('./tokens'));
router.use('/api/accounts', require('./accounts'));


module.exports = router;