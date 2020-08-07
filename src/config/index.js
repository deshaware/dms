const env = require('dotenv');
const path = require('path');
const mongoose = require('mongoose')

let result = env.config({ path: path.join( __dirname, '..', '..', '.env') });
if(result.error) throw result.error;

//Database
mongoose.connect(process.env.MONGOLAB_URI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then((s)=>{
    console.log("Connected to the database")
}).catch(e=>console.log(`Error while connecting to db ${e}`));