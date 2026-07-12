import mongoose, {Schema} from "mongoose"

const clickAnalysisSchema = new Schema({
    optIn:{
        type: Boolean,
        default: false
    },
    userId:{
        type: String
    },
    ip: {
        type: String,
    },
    device:{
        type: String,
    },
    country:{
        type: String,
    }
},
{timestamps: true}
)

export const ClickAnalysis = mongoose.model("clickAnalysis", clickAnalysisSchema);