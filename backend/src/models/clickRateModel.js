const clickRateModel = new Schema({
    ip: {
        type: String,
        required: true
    },
    device:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    }
},
{timestamps: true}
)