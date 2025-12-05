"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const user_js_1 = require("../controllers/user.js");
const isAuth_js_1 = require("../middleware/isAuth.js");
const router = express_1.default.Router();
// Debug route
router.get("/test-auth", (req, res) => {
    res.json({ message: "Auth routes are working" });
});
// Email/OTP Authentication Routes
router.post("/login", user_js_1.loginUser);
router.post("/verify", user_js_1.verifyUser);
// Google OAuth Routes
router.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login", session: false }), user_js_1.googleAuthCallback);
// Protected Routes
router.get("/me", isAuth_js_1.isAuth, user_js_1.myProfile);
router.get("/user/all", isAuth_js_1.isAuth, user_js_1.getAllUsers);
router.get("/user/:id", user_js_1.getAUser);
router.post("/update/user", isAuth_js_1.isAuth, user_js_1.updateName);
exports.default = router;
