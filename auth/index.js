var passport = require('passport');
var passportJWT = require('passport-jwt');
var extractJWT = passportJWT.ExtractJwt;
var strategyJwt = passportJWT.Strategy;

var params = {
    secretOrKey: 'cryws',
    jwtFromRequest: extractJWT.fromAuthHeaderWithScheme("jwt")
}


var jwtStrategyAdmin = new strategyJwt(params, function(payload, done) {
    if (payload.rule==='admin') {
        return done(null,  {username: payload.username, rule: payload.rule});
    } else {
        return done(null, false);
    }
})
var jwtStrategyUser = new strategyJwt(params, function(payload, done) {
    if (payload.rule==='user') {
        return done(null,  {username: payload.username, rule: payload.rule});
    } else {
        return done(null, false);
    }
})
var jwtStrategyBoth = new strategyJwt(params, function(payload, done) {
    if (payload.rule==='user' || payload.rule==='admin') {
        return done(null,  {username: payload.username, rule: payload.rule});
    } else {
        return done(null, false);
    }
})

passport.use('jwtadmin', jwtStrategyAdmin);
passport.use('jwtuser', jwtStrategyUser);
passport.use('jwtboth', jwtStrategyBoth);

var isJwtAuthenticated = {};
isJwtAuthenticated.Admin =  passport.authenticate('jwtadmin', {session: false});
isJwtAuthenticated.User =  passport.authenticate('jwtuser', {session: false});
isJwtAuthenticated.Both =  passport.authenticate('jwtboth', {session: false});
isJwtAuthenticated.SendHTTPCode = function (res, code) {
    res.status(code);
}

module.exports = isJwtAuthenticated;