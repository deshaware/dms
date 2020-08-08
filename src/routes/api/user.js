const router = require('express').Router();
const User = require('../../models/User');
const Directory = require('../../models/Directory');

/**
 * @swagger
 * /user/signup:
 *  post:
 *      summary: Signup New User
 *      description: Creates a user and returns a token
 *      tags:
 *          - signup
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
        if( !username || !password )
            res.status(422).send({ status: 'FAILED', error: 'Invalid Input, please provide username and password'})
        const user = new User({ username, password });
        await user.isUserExit();
        await Directory.createRootFolder(user);
        const token = await user.generateAuthToken();
        res.status(201).send({ status: 'SUCCESS', message: 'User Signed up successfully', response: { user,token }});
    } catch (error) {
        res.status(400).send({ status: 'FAILED', message: 'Could not create user', error:error.message})
    }
});

/**
 * @swagger
 * /user/login:
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
        res.status(200).send({ status: 'SUCCESS', message: 'Logged In!', response:{ user,token } });
    } catch (error) {
        res.status(400).send({ status: 'FAILED', message: 'Could not log in', error:error.message})
    }
});

module.exports = router;