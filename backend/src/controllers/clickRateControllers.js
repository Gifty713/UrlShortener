import { ClickAnalysis } from "../models/clickRateModel.js";
import clickRateRouter from "../routes/clickRateRoutes.js";
import geoip from "geoip-country";
import {UAParser} from "ua-parser-js";
import crypto from "crypto";

// Endpoints
const getAnalysis =async(req, res)=>{
    try {
        const {optIn} = req.body;
        // For Users that don't want to participate in analysis action
        if(!optIn){
            return(res.status(200).json({message: "User denied participating in tracking activity"}));
        }

        // For Users that do
        // Get ip address
        let userIP = req.ip;

        // Ensure that Ip address is unique per day;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const hashedIP = crypto.createHmac("sha256", process.env.SECRET_KEY).update(userIP).digest("hex");
        
        const isDuplicated = await ClickAnalysis.findOne({ip: hashedIP, createdAt: {$gte: startOfDay, $lt : endOfDay }});
        if (isDuplicated){
            return(res.status(200).json({message: "User has already been analyzed therefore will be exempted from analysis."}));
        }
        // Get Country
        const geo = geoip.lookup(userIP);
        const country = geo ? geo.country : "Unknown";
        
        // Get device
        const userAgent = req.headers["user-agent"];
        const parser = new UAParser(userAgent);
        const result = parser.getDevice();
        const device = result.type || "Desktop";

        const clickAnalysis = await ClickAnalysis.create({
            optIn: optIn,
            ip: hashedIP,
            country: country,
            device: device
        })
        res.status(201).json({message:"Analysis complete.", clickAnalysis});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
    }
}

export default getAnalysis;