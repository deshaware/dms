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

directorySchema.statics.createRootFolder = async (user) => {
    try {
        const rootFolder = new Directory( { name:'my-drive', path:'/my-drive', createdBy: user._id })
        await rootFolder.save()
    } catch (error) {
        console.log(error)
        throw new Error("Could not create a root directory for user")
    }
}

directorySchema.methods.validateCreateDirectory = () => {
    console.log()
}

module.exports = Directory = mongoose.model('Directory', directorySchema);