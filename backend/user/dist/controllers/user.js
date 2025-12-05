"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallback = exports.getAUser = exports.getAllUsers = exports.updateName = exports.myProfile = exports.verifyUser = exports.loginUser = void 0;
const generateToken_js_1 = require("../config/generateToken.js");
const rabbitmq_js_1 = require("../config/rabbitmq.js");
const TryCatch_js_1 = __importDefault(require("../config/TryCatch.js"));
const index_js_1 = require("../index.js");
const User_js_1 = require("../model/User.js");
exports.loginUser = (0, TryCatch_js_1.default)(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await index_js_1.redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({
            message: "Too may requests. Please wait before requesting new opt",
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await index_js_1.redisClient.set(otpKey, otp, {
        ex: 300,
    });
    await index_js_1.redisClient.set(rateLimitKey, "true", {
        ex: 10, // Rate limit: 10 seconds between OTP requests
    });
    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your OTP is ${otp}. It is valid for 5 minutes`,
    };
    await (0, rabbitmq_js_1.publishToQueue)("send-otp", message);
    // DEBUG: Log OTP to console (remove in production)
    console.log(`📧 OTP for ${email}: ${otp}`);
    res.status(200).json({
        message: "OTP sent to your mail",
    });
});
exports.verifyUser = (0, TryCatch_js_1.default)(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "Email and OTP Required",
        });
        return;
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await index_js_1.redisClient.get(otpKey);
    // Convert both to strings for comparison
    const storedOtpStr = storedOtp ? String(storedOtp) : null;
    const enteredOtpStr = String(enteredOtp);
    console.log("🔍 OTP Debug:", {
        email,
        enteredOtp: enteredOtpStr,
        storedOtp: storedOtpStr,
        match: storedOtpStr === enteredOtpStr
    });
    if (!storedOtpStr || storedOtpStr !== enteredOtpStr) {
        res.status(400).json({
            message: "Invalid or expired OTP",
        });
        return;
    }
    await index_js_1.redisClient.del(otpKey);
    let user = await User_js_1.User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 8);
        user = await User_js_1.User.create({ name, email });
    }
    const token = (0, generateToken_js_1.generateToken)(user);
    res.json({
        message: "User Verified",
        user,
        token,
    });
});
exports.myProfile = (0, TryCatch_js_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});
exports.updateName = (0, TryCatch_js_1.default)(async (req, res) => {
    const user = await User_js_1.User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            message: "Please login",
        });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = (0, generateToken_js_1.generateToken)(user);
    res.json({
        message: "User Updated",
        user,
        token,
    });
});
exports.getAllUsers = (0, TryCatch_js_1.default)(async (req, res) => {
    const users = await User_js_1.User.find();
    res.json(users);
});
exports.getAUser = (0, TryCatch_js_1.default)(async (req, res) => {
    const user = await User_js_1.User.findById(req.params.id);
    res.json(user);
});
// Google OAuth Callback Handler
exports.googleAuthCallback = (0, TryCatch_js_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            message: "Authentication failed",
        });
        return;
    }
    const token = (0, generateToken_js_1.generateToken)(user);
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
});
