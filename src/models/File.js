const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        lowercase: true,
        maxlength : [100,"Too many characters"],
        trim:true
    },
    fileContent: {
        type: String,
        required: true,
        maxlength : [5000,"Too many characters"],
        trim:true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    dir_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Directory'
    },
    isDeleted: {
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


fileSchema.methods.validateFileName = async function({ _id }, folder) {
    let newFile = this;
    const isExit = await File.findOne({ fileName: newFile.fileName, dir_id: folder._id,  owner_id: _id, isDeleted: false });
    if(isExit) 
        throw new Error(`${newFile.fileName} already exist in the current folder`)
    return
}


module.exports = File = mongoose.model('File', fileSchema);