const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require("./config")
console.log('Environment', process.env.NODE_ENV );

const app = express();

//cors setting
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Routes
const user = require('./routes/api/user');
const directory = require('./routes/api/directory');
const file = require('./routes/api/file');
const dashboard = require('./routes/api/dashboard');
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
        servers: [{url: `${process.env.URL}/api/v1`}],
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
        __dirname + '/routes/api/user.js',
        __dirname + '/routes/api/dashboard.js',
        __dirname + '/routes/api/directory.js',
        __dirname + '/routes/api/file.js'
    ]
  };
const swaggerDocs = swaggerJsDoc(swaggerOpenApiOptions);
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.get('/', (req, res) => res.status(200).send({message:'DMS App is up and running'}))

//Serve
const server = app.listen(process.env.PORT || 3000,
     () => console.log(`App listening on port ${process.env.PORT || 3000}`
));

module.exports = { app, server };