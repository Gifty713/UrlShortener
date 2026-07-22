import jwt from "jsonwebtoken";
const authenticateToken =(req, res, next)=>{
    const authHeader = req.headers["authorization"];
    // this is going to be used by visitors, so there should be provision for them
    if (!authHeader){
        req.userId = null;
        return next();
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
        req.user = decoded.id;
        next();
    });
}

const generateToken = (id)=>{
    return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"});
}

const requireAuthenticatedUser = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized user." });
    next();
}

export {authenticateToken, requireAuthenticatedUser, generateToken};
