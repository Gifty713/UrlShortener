import jwt from "jsonwebtoken";
const authenticateToken =(req, res, next)=>{
    const authHeader = req.headers["authorization"];
    // No token
    if (!authHeader){
        return res.status(401).json({message: "Unauthorized user."});
    }   
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({message: "Unauthorized user."});
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded )=>{
        if (err){
            if(err.name === "TokenExpiredError") return res.status(401).json({message:"Expired access token"});
            return res.status(403).json({message:"Access Denied"})
        }
        req.user = decoded;
        next();
    });
}

const generateToken = (email)=>{
    return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"60s"});
}

export {authenticateToken, generateToken};
