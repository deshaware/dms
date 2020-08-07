const router = require('express').Router();
const User = require('../../models/User');

/**
 * @swagger
 * /signup:
 *  post:
 *      summary: Signup New User
 *      description: Creates a user and returns a token
 *      tags:
 *          - signup
 *      responses:
 *          201:
 *              description: Creates a user and Returns a user with token
 *          400:
 *              description: User not created
 *          422:
 *              description: Unprocessable Entity
 * 
 */
router.post('/signup', async ( req, res ) => {
    try {
        let { username, password } = req.body;
        if(!username || !password)
            res.status(422).send({ message: 'FAILED', error: 'Invalid Input, please provide username and password'})
        const user = new User({username, password})
        await user.isUserExit();
        const token = await user.generateAuthToken();
        res.status(201).send({ message: 'SUCCESS', response:{ user,token} });
    } catch (error) {
        res.status(400).send({ message: 'FAILED', error:error.message})
    }
});

/**
 * @swagger
 * /login:
 *  post:
 *      summary: Login User
 *      description: Creates a user and returns a token
 *      tags:
 *          - login
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: # Request body contents
 *                      type:
 *                          object
 *                      properties:
 *                          username:
 *                              type:
 *                                  string
 *                          password:
 *                              type:
 *                                  string
 *      responses:
 *          200:
 *              summary: Login User
 *              description: Returns a user with token
 *          400:
 *              description: Unable to login
 *          422:
 *              description: Unprocessable Entity
 * 
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByCredentials(username, password)
        const token = await user.generateAuthToken()
        console.log("user")
        res.status(200).send({ message: 'SUCCESS', response:{ user,token } });
    } catch (error) {
        res.status(400).send({ message: 'FAILED', error:error.message})
    }
});

module.exports = router;