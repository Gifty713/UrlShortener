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
    isQrcode :{
        type:Boolean
    },
    // clickCount is total clickCount
    clickCount:{
        type: Number,
        default: 0
    },
    isLoginnedIn:{
        type: Boolean
    }
},
{timestamps:true}
)
// Index to  delete database if expiry date.
urlSchema.index(
    {expiryDate: 1}, {expireAfterSeconds:0, partialFilterExpression:{$type: "date"}}
)

// Hashing the password before saving
urlSchema.pre("save", async function(){;
    if (!this.password) return;
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})


// Defined function to compare password
urlSchema.methods.comparePassword = async function (pwd){
    if (!this.password) return;
    return await bcrypt.compare(pwd, this.password);
}

export const Url = mongoose.model("url", urlSchema);