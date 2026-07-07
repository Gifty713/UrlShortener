import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./config/database.js";

dotenv.config({
    path:"./.env"
})

const startServer = async()=>{
    try {
        await connectDb();
        app.on("error",(error)=>{
            console.log("Error occured.", error)
            throw error;
        });
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Connection successful on port ${process.env.PORT}.`)
        });
    } catch (error) {
        console.error("Error in starting server.", error)
    }
}
startServer();