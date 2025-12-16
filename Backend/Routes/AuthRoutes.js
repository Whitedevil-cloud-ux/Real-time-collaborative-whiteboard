const { signup, login, logout, updateProfile } = require("../Controllers/AuthController");
const router = require("express").Router();
const { verifyUser } = require("../Middlewares/AuthMiddlware");
const User = require("../models/User");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.get("/profile", verifyUser, async (req, res) => {
   try {
     // req.user contains the logged-in user's ID
     const user = await User.findById(req.user.id).select("-password");
     if(!user) {
        return res.status(404).json({ message: "User not found" });
     }
     res.status(200).json({ user });
   } catch (error) {
    console.error("Profile fetch error: ", error);
    res.status(500).json({ message: "Internal Server Error" });
   }
});

router.put("/profile", verifyUser, updateProfile);


module.exports = router;