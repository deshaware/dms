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
app.use('/hello', hello);
app.use('/api/v1/user', user);
app.use('/api/v1/folder', directory);
app.use('/api/v1/file', file);

//Documentation
const swaggerOptions = {
    swaggerDefinition:{
        swagger: '2.0',
        info: {
            version: '1.0.0',
            title: 'Document Management System',
            description: 'This is some description',
            contact: {
                name: 'Swapnil Deshaware'
            },
            server:['http://localhost:3000']
        },
        host: 'localhost:3000',
        basePath: '/',
        schemes: [ 'http', 'https' ],
        consumes: [ 'application/json' ],
        produces: [ 'application/json' ],
    },
    apis: [
        __dirname + '/routes/hello.js', 
        __dirname + '/routes/api/user.js',
        __dirname + '/routes/api/directory.js',
        __dirname + '/routes/api/file.js',
    ]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

//Serve
const server = app.listen(process.env.PORT,
     () => console.log('App listening on port 3000'));

module.exports = { app, server };