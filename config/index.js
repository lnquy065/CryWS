var config = require('./config.json');
module.exports = {
    getDBConnectionString: function() {
        return config.connection;
    }
};