import { Owner } from "../models/ownerModel.js";
import { refreshTokenModel } from "../models/refreshToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateToken } from "../middleware/jsonAuth.js";
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
        const authEmail = ({email:email.toLowerCase()});
        const accessToken = generateToken(authEmail);

        // create refresh token
        const refreshToken = jwt.sign(authEmail, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"4d"});

        // Hash refresh token, set expiryDate and get user id
        const tokenHashed = crypto.hash("sha256", refreshToken, "hex");
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 4);

        // Add token to database
        const userId = owner._id;
        const refToken = await refreshTokenModel.create({userId, tokenHashed, expiresAt:expiryDate});

        // send respond
        res.json({accessToken, refreshToken});
    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    }

}

const refreshToken= async(req, res)=>{
    try {
        const {token} = req.body;
        // validate refresh token
        if (!token) return res.status(401).json({message:"Unauthorized user."});
        // hash given token and verify if in database
        const hashedToken = crypto.hash("sha256", token, "hex");
        const isTokenInDB = await refreshTokenModel.findOne({tokenHashed: hashedToken})
        if (!isTokenInDB) return res.status(403).json({message:"Access denied. Invalid refresh token."});
        // verify token
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if(err) return res.status(403).json({message:"Access denied. Refresh token expired."});
            const accessToken = generateToken({email: user.email.toLowerCase()});
            // create new access token
            res.json({accessToken: accessToken});
        });        
    } catch (error) {
        return res.status(500).json({message:"Internal server error", error:error.message});
    }
}

const logOut = async(req, res)=>{
    try {
        const {email} = req.body;
        if (!email) return res.status(401).json({message:"Fill in all information please"});
        
        const owner = await Owner.findOne({email: email.toLowerCase()})  
        
        if(!owner) return res.status(404).json({message:"User not found, try again."})

        const ownerId = owner._id;
        await refreshTokenModel.findOneAndDelete({userId: ownerId});
        
        res.status(200).json({message:"Logout Successful"})

    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    };
}

export {registerUser, loginUser, logOut, refreshToken};
