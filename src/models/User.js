const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        minlength: 5,
        maxlength : [40,"Too many characters"],
        trim:true
    },
    password:{
        type:String,
        required: true,
        minlength: 7,
        trim: true,
    },
    authTokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{ timestamps:true });


userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.authTokens
    return userObj
}

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8);
    }
    next()
});

userSchema.methods.isUserExit = async function() {
    const user = this;
    const userName = await mongoose.models.User.countDocuments({username: user.username  });
    console.log(userName)
    if(userName > 0 )
        throw new Error(`User with username ${user.username} already exist`);
}


userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = await jwt.sign({ _id:user._id.toString()}, process.env.SECRET );
    console.log(token)
    user.authTokens = user.authTokens.concat({ token });
    await user.save()
    return token;
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) 
        throw new Error('Unable to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) 
        throw new Error('Unable to login')
    return user
}


module.exports = User = mongoose.model('User',userSchema);