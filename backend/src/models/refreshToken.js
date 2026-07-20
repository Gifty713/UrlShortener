import mongoose, {Schema} from "mongoose";

const refreshTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    tokenHashed:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    expiresAt:{
        type:Date,
        required: true
    }
},
{
    timestamps: true
}
)

// TTl index
refreshTokenSchema.index(
    {expiresAt:1}, {expireAfterSeconds: 0}
)

export const refreshTokenModel = mongoose.model("refreshToken", refreshTokenSchema);