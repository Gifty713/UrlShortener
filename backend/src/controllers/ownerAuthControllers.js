import { Owner } from "../models/ownerModel.js";

const registerUser = async(req, res)=>{
    try {
        const {username, password, email} = req.body
        // basic validation
        if (!username || !password || !email){
            return res.status(400).json({message:"All fields are important!"})
        }
        // checks if user already exists
        const existing = await Owner.findOne({email : email.toLowerCase()})
        if (existing){
            return res.status(400).json({message:"User already exists!"})
        }
        // Create user if conditions are fulfilled 
        const owner = await Owner.create({
            username,
            password,
            email:email.toLowerCase(),
            loggedIn: false,
        });
        res.status(201).json({message:`Successfully registered user`, user: {id:owner._id, email:owner.email, username:owner.username }});
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
        if (!user){
            return res.status(400).json({message:"User not registered, refer to register page."})
        }  

        // compare passwords
        const isMatch = await Owner.comparePassword(password);
        if (!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }

        res.status(200).json({message:"Login Successful.", 
            user:{
                id: owner._id,
                email: owner.email, 
                username: owner.username
            } 
        })
    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    }

}

const logOut = async(req, res)=>{
    try {
        const {email} = req.body;
        if (!email){
            res.status(401).json({message:"Fill in all information please"})
        }
        const owner = await Owner.findOne({email: email.toLowerCase()})  
        
        if(!owner) return res.status(404).json({message:"User not found, try again."})

        res.status(200).json({message:"Logout Successful"})

    } catch (err) {
        return res.status(500).json({message:"Internal Server Error", error:`Error:${err}`})
    };
}

export {registerUser, loginUser, logOut};
