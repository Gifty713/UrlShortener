import { Url } from "../models/urlModel.js";
import urlRouter from "../routes/urlRoutes.js";
import { nanoid } from "nanoid";
import qrcode from "qrcode";
import rateLimit from "express-rate-limit";

const createAlias =async (req, res)=>{
    try {
        const {originalURL,customAlias,password,expiryDate, isQrcode} = req.body;

        // Validation for url
        if (!originalURL){
            return(res.status(400).json({message:"You need to fill in a URL"}));
        }
        
        // To check if it is a real url
        try {
            await fetch(originalURL, { method: 'HEAD' });
        } catch (error) {
            throw new Error(res.status(404).json({message:"This URL is not live."}));
        }

        // this checks if protocol is present, if not adds http as default protocol
        const checkingProtocol = originalURL.startsWith("http") ? originalURL : `http://${originalURL}`;
        const formattedUrl = new URL(checkingProtocol);

        // Checking for top level domain, if not sends error
        if(formattedUrl.hostname.split(".").length < 2){
            return (res.status(400).json({message:"Top Level Domain absent, add a .com, .ng, or appropriate suffix to the url."}))
        }

        // Validation for Date
        if(expiryDate){
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(expiryDate) < today){
                return(res.status(400).json({message:"Return a date that's from today upwards."}))
            }
        }

        // Custom Alias Verification 
        let verCustomAlias = null;
        if(customAlias){
            const trimmedCustom = customAlias.trim();
            // not more than 7 strings
            if (trimmedCustom.length > 7){
                return(res.status(400).json({message:"Custom Alias must not be more than 7."}));
            }
            // Checking if custom is taken and setting verified custom alias
            const existingBeforeCustom = await Url.findOne({alias:trimmedCustom});
            if (existingBeforeCustom){
                return(res.status(409).json({message:"Oops, this alias has been taken."}));
            }
            verCustomAlias = trimmedCustom;
        };

        // Create Alias
        const alias = verCustomAlias || nanoid(5);
        // check if alias is taken
        let existing = await Url.findOne({alias: alias});
        while (existing){
            alias = nanoid(5);
            existing = await Url.findOne({alias: alias})
        }

        // Create qrcode
        let qrData = "No qrcode requested";
        if(isQrcode){
            qrData = await qrcode.toDataURL(originalURL);
        }
        // create record
        const url = await Url.create({
            originalURL: formattedUrl,
            alias,
            expiryDate, 
            password,
            clickCount: 0
        })

        res.status(201).json({message:`Url successfully registered, here is your shortened url /${alias}`, url, qrData})
           
    } catch (error) {
        res.status(500).json({message:"Internal server error.", error:error.message});
    }    
}

// rate limiter for creating url
const rateLimiterCreateEndpoint = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 10,
    message: "Too many requests."
})

const redirectUrl= async(req, res)=>{
    try {
        //fetch the original url connected to the url and also verify if alias is valid 
        const url = await Url.findOne({alias:req.params.alias}); 
        if(!url){
            return(res.status(404).json({message:"This alias was not found on our database."}));
        }
        // check if password protected and redirect to password page.
        const PasswordProtected = url.password;
        if (PasswordProtected){
            return(res.status(401).json({message:"Page is password protected."}));
        }
        await Url.findOneAndUpdate({alias:req.params.alias}, {$inc:{clickCount: 1}}, {new:true});
        res.redirect(`${url.originalURL}`);
    } catch (err) {
        res.status(500).json({message:"Internal server error.", error:err.message});
    }
}

const passwordRedirect =async(req, res)=>{
    try {
        const {password} = req.body;
        const url = await Url.findOne({alias: req.params.alias});
        if(!url){
            return(res.status(404).json({message:"This alias was not found on our database."}))
        }

        // Compare the passwords
        const isMatch = await url.comparePassword(password);
        if (!isMatch){
            return(res.status(401).json({message:"Incorrect password."}));
        }
        await Url.findOneAndUpdate({alias:req.params.alias},{$inc:{clickCount:1}}, {new:true});
        res.redirect(`${url.originalURL}`);
    } catch (err) {
        res.status(500).json({message:"Internal Server Error.", error:err.message});
    }   
}
const rateLimiterPwdEndpoint = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many tries on password."
})
export {createAlias, rateLimiterCreateEndpoint, redirectUrl, rateLimiterPwdEndpoint, passwordRedirect};