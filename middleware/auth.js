const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    //get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // verify and decode token
    try {
        const decodec = jwt.verify(token, config.get('jwtSecret'));
        
        eq.user = decoded.user;
        next(); //need next to move onto the next request because it's middleware
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}