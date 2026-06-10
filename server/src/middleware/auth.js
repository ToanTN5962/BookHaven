const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if((!authHeader)){
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    }
    catch(error){
        console.warn('JWT verify error:', error && error.message ? error.message : error);
        return res.status(403).json({
            message: "Invalid token",
            error: error && error.message ? error.message : undefined
        });
    }
}

module.exports = verifyToken;