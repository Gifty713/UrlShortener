import { Url } from "../models/urlModel.js";
import urlRouter from "../routes/urlRoutes.js";
import { nanoid } from "nanoid";
import qrcode from "qrcode";
import rateLimit from "express-rate-limit";
import { Owner } from "../models/ownerModel.js";

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
        let alias = verCustomAlias || nanoid(5);
        // check if alias is taken
        let existing = await Url.findOne({alias: alias});
        while (existing){
            alias = nanoid(5);
            existing = await Url.findOne({alias: alias})
        }
        
        let url;
        if (!req.user){
            // url for visitors
            url = await Url.create({
                originalURL: formattedUrl,
                alias,
                expiryDate, 
            })            
        }else{
            const userId = req.user;
            // url for users
            url = await Url.create({
                userId: userId , 
                originalURL: formattedUrl,
                alias,
                expiryDate, 
                password,
                clickCount: 0
            })
        }
        const safeUrl = url.toObject();
        const passwordProtected = Boolean(safeUrl.password);
        delete safeUrl.password;
        res.status(201).json({message:`Url successfully registered, here is your shortened url /${alias}`, url: { ...safeUrl, passwordProtected }})
           
    } catch (error) {
        res.status(500).json({message:"Error in creating alias", error:error.message});
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
        await Url.findOneAndUpdate({alias:req.params.alias}, {$inc:{clickCount: 1}}, {returnDocument: 'after'});
        if (req.query.mode === "json") return res.json({ redirectUrl: url.originalURL });
        res.redirect(`${url.originalURL}`);
    } catch (err) {
        res.status(500).json({message:"Redirect error.", error:err.message});
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
        await Url.findOneAndUpdate({alias:req.params.alias},{$inc:{clickCount:1}}, {returnDocument: 'after'});
        if (req.query.mode === "json") return res.json({ redirectUrl: url.originalURL });
        res.redirect(`${url.originalURL}`);
    } catch (err) {
        res.status(500).json({message:"Redirect error.", error:err.message});
    }   
}
const rateLimiterPwdEndpoint = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many tries on password."
})

const getUrls = async(req, res)=>{
    try {
        const userId = req.user;
        if (userId == null) return res.status(401).json({message:"This user is unauthorized to get urls."});
        const userUrls = await Url.find({userId: userId});
        const safeUrls = userUrls.map(url => {
            const { password, ...safeUrl } = url.toObject();
            return { ...safeUrl, passwordProtected: Boolean(password) };
        });
        res.status(200).json({message:"User url info, gotten.", userUrls: safeUrls});
    } catch (error) {
        res.status(500).json({message:"Error in fetching url information.", error:error.message});
    }
}

const resolveUrl = async (req, res) => {
    try {
        const url = await Url.findOne({ alias: req.params.alias }).select("alias password");
        if (!url) return res.status(404).json({ message: "This link could not be found." });
        res.json({ alias: url.alias, passwordProtected: Boolean(url.password) });
    } catch (error) {
        res.status(500).json({ message: "Unable to resolve this link." });
    }
};

const generateQrCode=async(req, res)=>{
    try {
        const url = await Url.findOne({alias: req.params.alias, userId: req.user});
        if(!url)return res.status(404).json({message:"Url not found."});     
        const qrData = await qrcode.toDataURL(url.originalURL);
        res.status(201).json({message:"QrCode successfully created", qrData});
    } catch (error) {
        res.status(500).json({message:"Error in generating qr code.", error:error.message});
    }
}

const deleteUrlAlias =async(req, res)=>{
    try {
        const url = await Url.findOneAndDelete({alias: req.params.alias, userId: req.user});
        if(!url)return res.status(404).json({message:"Url not found."});
        res.status(204).json({message:"Successfully deleted."});
    } catch (error) {
        res.status(500).json({message:"Error in deleting alias.", error:error.message});
    }
}

const resetPassword=async(req, res)=>{
    try {
        const {password} = req.body;
        const url = await Url.findOne({alias:req.params.alias, userId: req.user});
        // validate url
        if(!url) return res.status(404).json({message:"Url not found."});
        // set new password
        url.password = password;
        await url.save();

        res.status(201).json({message: "Password reset!"});
    } catch (error) {
        res.status(500).json({message:"Error in resetting password.", error:error.message});
    }
}
const removePassword = async (req, res) => {
    try {
        const url = await Url.findOneAndUpdate(
            { alias: req.params.alias, userId: req.user },
            { $unset: { password: 1 } },
            { returnDocument: 'after' }
        );
        if (!url) return res.status(404).json({ message: "Url not found." });
        res.json({ message: "Password removed.", alias: url.alias, passwordProtected: false });
    } catch (error) {
        res.status(500).json({ message: "Error in removing password.", error: error.message });
    }
}
export {createAlias, rateLimiterCreateEndpoint, redirectUrl, passwordRedirect, getUrls, resolveUrl, rateLimiterPwdEndpoint, generateQrCode, deleteUrlAlias, resetPassword, removePassword};
