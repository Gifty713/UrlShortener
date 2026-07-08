import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";

const urlSchema = new Schema({
    originalURL:{
        type: String,   
        required: true,
        trim: true
    },
    password:{
        type: String,
        minLength: 8,
        maxLength: 15
    },
    expiryDate:{
        type:Date
    },  
    alias:{
        type: String,
        required: true,
        unique: true
    },
    qrCode:{
        type: String,
        unique: true
    }, 
    clickCount:{
        type: Number,
        default: 0
    },
},
{timestamps:true}
)
// Hashing the password before saving

// urlSchema.pre("save", async()=>{
//     if (!this.password.isModified()) return;
//     const hashedPwd = await bcrypt.hash(this.password, 10);
// })

// // Defined function to compare password
// urlSchema.methods.comparePassword = async(pwd)=>{
//     return await bcrypt.compare(pwd, this.password);
// }

export const Url = mongoose.model("url", urlSchema);
