const route = require("express").Router();

/**
 * @swagger
 * /hello:
 *  get:
 *      summary: Hello
 *      description: Returns Hello
 *      tags:
 *          - hello
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
 *              description: A Hello
 *          500:
 *              description: Internal Server Error
 *                      
 */
route.get("/", (req, res) => {
    console.log("hi")
    res.status(200).send({ message: "Hello", status: "Success", response: "Hi there!"});
});

module.exports = route;