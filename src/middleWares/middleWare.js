const jwt = require('jsonwebtoken')


//-----------------------------------------------------------------------------//


const getUserDetails = async function (req, res, next) {
    try {
        let token = req.headers['user-login-key']  //-----// handling of invalid token
        if (!token) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request' })
        }
        let decodedToken = jwt.verify(token, "functionupridersprivatekey")
        if (decodedToken) {
            req.userId = decodedToken.userId
            next();
        } else {
            return res.status(400).send({ status: false, message: 'Oops...token is not valid' })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//-----------------------------------------------------------------------------//
module.exports.getUserDetails = getUserDetails;
//-----------------------------------------------------------------------------//