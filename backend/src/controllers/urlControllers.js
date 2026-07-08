import { Url } from "../models/urlModel.js";
import urlRouter from "../routes/urlRoutes.js";
import { nanoid } from "nanoid";

const createAlias =async (req, res)=>{
    try {
        const {originalURL,password,expiryDate} = req.body;

        // Validation for url
        if (!originalURL){
            return(res.status(400).json({message:"You need to fill in a URL"}));
        }
        // this checks if protocol is present, if not adds http as default protocol
        const checkingProtocol = originalURL.startsWith("http") ? originalURL : `http://${originalURL}`;
        const formattedUrl = new URL(checkingProtocol);

        // Checking for top level domain, if not send error
        if(formattedUrl.hostname.split(".").length > 1){
            console.log("valid URL")
        }else{
            return (res.status(400).json({message:"Top Level Domain absent, add a .com, .ng, or appropriate suffix to the url."}))
        }

        // Validation for Date
        // if(expiryDate){
        //     const today = new Date();
        //     today.setHours(0, 0, 0, 0);
        //     if (new Date(expiryDate) < today){
        //         return(res.status(400).json({message:"Return a date that's from today upwards."}))
        //     }
        // }

        // validation Password
        // if (password){
        //     console.log("there's password")
        // }
        // Create Alias
        const alias = nanoid(5);
        // check if alias is taken
        let existing = await Url.findOne({alias: alias});
        while (existing){
            alias = nanoid(5);
            existing = await Url.findOne({alias: alias})
        }

        // create record
        const url = await Url.create({
            originalURL,
            alias,
        })

        res.status(201).json({message:`Url successfully registered, here is your shortened url www.${alias}.ping`})
           
    } catch (error) {
        res.status(500).json({message:"Internal server error.", error:error.message})
    }    
}

export default createAlias;