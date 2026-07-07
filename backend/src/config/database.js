import mongoose from "mongoose";
const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`Connection to database successful. ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error has been occurred when trying to connect to the database", error);
        process.exit(1);
    }
}
export default connectDb;