const mongoose = require('mongoose');
const User = require("./User");
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
    owner_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    parent_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Directory'
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
},{ timestamps:true });

directorySchema.statics.createRootFolder = async ( { _id }) => {
    try {
        const rootFolder = new Directory( { name:'my-drive', path:'/my-drive', owner_id: _id, createdBy: _id, updatedBy: _id })
        await rootFolder.save()
    } catch (error) {
        console.log(error)
        throw new Error("Could not create a root directory for user")
    }
}

directorySchema.methods.validateCreateDirectory = async function({ _id}) {
    let newFolder = this;
    const isExit = await Directory.findOne({ path: newFolder.path, owner_id: _id, isDeleted:false });
    if(isExit) 
        throw new Error("Folder already exists")
    return
}

module.exports = Directory = mongoose.model('Directory', directorySchema);