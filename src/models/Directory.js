const mongoose = require('mongoose');
const directorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        maxlength : [100,"Too many characters"],
        trim:true
    },
    path:{
        type: String,
        required: true,
        maxlength : [1000,"Too many characters"],
        trim:true
    },
    parent_id:{
        type: Schema.Types.ObjectId, 
        ref: 'Directory'
    },
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    createdBy
},{timestamps:true});

module.exports = Directory = mongoose.model('Directory',directorySchema);