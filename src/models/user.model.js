import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    avatar:{
        type: String,
        required: true,
    },
    coverImage:{
        type: String
    },
    about:{
        type:String,
        required:true
    },
    instagram:{
        type:String
    },
    facebook:{
        type:String
    },
    linkedin:{
        type:String
    },
    website:{
        type:String
    },
    post:[{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    }],
    refreshToken:{
        type: String
    }
    
    
},{timestamps: true})

userSchema.index({username:'text', fullName:'text'})

userSchema.pre("save", async function(next){
    if(!this.isModified("password"))return next();
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName
     }
     , process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        _id: this._id,
     },
      process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User =  mongoose.model("User", userSchema)