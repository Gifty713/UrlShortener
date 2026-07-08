import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Connection successful.", connectionInstance.connection.host)
    } catch (error) {
        console.error("Error in connecting database", error);
        process.exit(1);
    }
}
export default connectDb;