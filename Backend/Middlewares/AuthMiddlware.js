require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.verifyUser = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        req.user = {
            id: decoded.id,
            role: decoded.role || "user",
        };

        next();

    } catch (error) {
        console.error("Auth error: ", error);
        res.status(401).json({ message: "Unauthorized or invalid token" });
    }
};
