import { Owner } from "../models/ownerModel.js";
import { refreshTokenModel } from "../models/refreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateToken } from "../middleware/jsonAuth.js";
const refreshCookieName = "refreshToken";
const refreshCookieOptions = () => {
    const sameSite = process.env.COOKIE_SAME_SITE || "lax";
    return { httpOnly: true, secure: sameSite === "none" || process.env.NODE_ENV === "production", sameSite, path: "/api/v1/auth", maxAge: 4 * 24 * 60 * 60 * 1000 };
};
const readRefreshCookie = (req) => req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${refreshCookieName}=`))?.slice(refreshCookieName.length + 1);
const registerUser = async(req, res)=>{
    try {
        const {password, email} = req.body;
        // basic validation
        if (!password || !email){
            return res.status(400).json({message:"All fields are important!"});
        }
        // checks if user already exists
        const existing = await Owner.findOne({email : email.toLowerCase()})
        if (existing){
            return res.status(400).json({message:"User already exists!"})
        }
        // Create user if conditions are fulfilled 
        const owner = await Owner.create({
            password,
            email:email.toLowerCase(),
        });
        res.status(201).json({message:`Successfully registered user`});
    } catch (err) {
        res.status(500).json({message:`Server Error detected`, error: err.message})
    }
}

const loginUser = async(req, res)=>{
    try {
        const{password, email} = req.body

        if (!password || !email){
            return res.status(400).json({message:"fill all fields please"})
        }

        const owner = await Owner.findOne({email: email.toLowerCase()})
        if (!owner){
            return res.status(400).json({message:"User not registered, refer to register page."})
        }  

        // compare passwords
        const isMatch = await owner.comparePassword(password);
        if (!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }

        // Authenticate and generate access token
        const authId = ({id:owner._id});
        const accessToken = generateToken(authId);

        // create refresh token
        const refreshToken = jwt.sign(authId, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"4d"});

        // Hash refresh token, set expiryDate and get user id
        const tokenHashed = crypto.hash("sha256", refreshToken, "hex");
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 4);

        // Add token to database
        const userId = owner._id;
        await refreshTokenModel.create({userId, tokenHashed, expiresAt:expiryDate});

        res.cookie(refreshCookieName, refreshToken, refreshCookieOptions());
        res.json({accessToken});
    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    }

}

const refreshToken= async(req, res)=>{
    try {
        const token = readRefreshCookie(req);
        // validate refresh token
        if (!token) return res.status(401).json({message:"Unauthorized user."});
        // hash given token and verify if in database
        const hashedToken = crypto.hash("sha256", token, "hex");
        const isTokenInDB = await refreshTokenModel.findOne({tokenHashed: hashedToken})
        if (!isTokenInDB) return res.status(403).json({message:"Access denied. Invalid refresh token."});
        // verify token
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if(err) return res.status(403).json({message:"Access denied. Refresh token expired."});
            const accessToken = generateToken({id:user.id});
            // create new access token
            res.json({accessToken: accessToken});
        });        
    } catch (error) {
        return res.status(500).json({message:"Internal server error", error:error.message});
    }
}

const logOut = async(req, res)=>{
    try {
        const token = readRefreshCookie(req);
        if (token) {
            const tokenHashed = crypto.hash("sha256", token, "hex");
            await refreshTokenModel.findOneAndDelete({tokenHashed});
        }
        res.clearCookie(refreshCookieName, refreshCookieOptions());
        
        res.status(200).json({message:"Logout Successful"})

    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    };
}

export {registerUser, loginUser, logOut, refreshToken};
