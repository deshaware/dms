const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

process.env.NODE_ENV = 'dev'
console.log('Environment', process.env.NODE_ENV );

require("./config")
const app = express();

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Routes
const hello = require('./routes/hello');
const user = require('./routes/api/user');
const directory = require('./routes/api/directory');
const file = require('./routes/api/file');
const dashboard = require('./routes/api/dashboard');
app.use('/hello', hello);
app.use('/api/v1/user', user);
app.use('/api/v1/folder', directory);
app.use('/api/v1/file', file);
app.use('/api/v1/dashboard', dashboard);

//Documentation
const swaggerOpenApiOptions =  {
    swaggerDefinition : {
        openapi: '3.0.1',
        info: {
        title: 'Document Management System API Specification', 
        version: '1.0.0', 
        description: 'OpenAPI documentation for Document Managemet System', 
        },
        servers: [{url: 'http://localhost:3000/api/v1'}],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: [
        __dirname + '/routes/hello.js', 
        __dirname + '/routes/api/user.js',
        __dirname + '/routes/api/directory.js',
        __dirname + '/routes/api/file.js',
        __dirname + '/routes/api/dashboard.js'
    ]
  };
const swaggerDocs = swaggerJsDoc(swaggerOpenApiOptions);
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

//Serve
const server = app.listen(process.env.PORT,
     () => console.log('App listening on port 3000'));

module.exports = { app, server };