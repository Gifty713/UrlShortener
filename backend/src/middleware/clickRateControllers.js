import { ClickAnalysis } from "../models/clickRateModel.js";
import geoip from "geoip-country";
import {UAParser} from "ua-parser-js";
import crypto from "crypto";

// Endpoints
const getAnalysis =async(req, res, next)=>{
    try {
        const optIn = req.query.optIn === "true";
        // For Users that don't want to participate in analysis action
        if(!optIn){
            return next();
        }

        // For Users that do
        // Get ip address
        let userIP = req.ip;

        // Ensure that Ip address is unique per day;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        const analyticsSecret = process.env.SECRET_KEY || process.env.ACCESS_TOKEN_SECRET;
        if (!analyticsSecret) {
            console.error("Analytics skipped: no hashing secret is configured.");
            return next();
        }
        const hashedIP = crypto.createHmac("sha256", analyticsSecret).update(userIP).digest("hex");
        
        const isDuplicated = await ClickAnalysis.findOne({ip: hashedIP, createdAt: {$gte: startOfDay, $lt : endOfDay }});
        if (isDuplicated){
            return next();
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
        return next();
    } catch (error) {
        // Analytics is optional and must never prevent a visitor from continuing.
        console.error("Analytics collection failed:", error);
        return next();
    }
}

export default getAnalysis;

export const getAnalytics = async (req, res) => {
    try {
        const [total, countries, devices, trend] = await Promise.all([
            ClickAnalysis.countDocuments(),
            ClickAnalysis.aggregate([{ $group: { _id: "$country", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
            ClickAnalysis.aggregate([{ $group: { _id: "$device", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
            ClickAnalysis.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: 1 } } }, { $sort: { _id: 1 } }])
        ]);
        res.json({ totalClicks: total, uniqueVisitors: total, countries: countries.map(item => ({ name: item._id || "Unknown", value: item.value })), devices: devices.map(item => ({ name: item._id || "Unknown", value: item.value })), trend: trend.map(item => ({ date: item._id, value: item.value })) });
    } catch (error) {
        res.status(500).json({ message: "Unable to retrieve analytics." });
    }
};
