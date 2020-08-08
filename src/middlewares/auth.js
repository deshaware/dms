const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        if(!token) throw new Error('User not authenticated')
        token = token.replace('Bearer ', '')
        const decode = jwt.verify( token, process.env.SECRET);
        const user = await User.findOne({ _id: decode._id, 'authTokens.token':token });
        if(!user){
            throw new Error('Unauthorized')
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send({ status: 'FAILED', message: 'Failed to authorize user', error:error.message})
    }
};
module.exports = auth;