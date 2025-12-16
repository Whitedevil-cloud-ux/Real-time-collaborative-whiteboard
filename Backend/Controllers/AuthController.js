const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { createSecretToken } = require("../Util/SecretToken");

module.exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password, role: "user", });
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });
        res.status(201).json({ message: "User signed up successfully", success: true, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password ){
            return res.json({ message: "All fields are required "});
        }
        const user = await User.findOne({ email }).select("+password");
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const auth = await bcrypt.compare(password, user.password);
        if(!auth) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = createSecretToken(user._id);
        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        });
        const { password: _, ...safeUser } = user._doc;

        res.status(201).json({
            message: "User logged in successfully",
            success: true,
            user: safeUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.logout = (req, res) =>{
    console.log("Logout request received");
    res.clearCookie("token");
    return res.status(200).json({
        message: "User logged out successfully",
        status: true
    });
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true }
        ).select("-password");

        return res.status(200).json({ message: "Profile updated successfully ", user: updatedUser });
    } catch (error) {
        console.error("Profile update error: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};