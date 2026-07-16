import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"

const ownerSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,    
            trim: true,
            minLen: 1,
            maxLen: 30,
        },
        password:{
            type: String,
            required: true,
            minLen: 6,
            maxLen: 40,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,  
        }, 
    },
    {
        timestamps:true
    }
);
// hash password for security
ownerSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    const hashed_pwd = await bcrypt.hash(this.password, 10);
}); 
// compare passwords function
ownerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const Owner = mongoose.model("owner", ownerSchema); 