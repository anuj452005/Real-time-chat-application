import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({
      message: "Too may requests. Please wait before requesting new opt",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    ex: 300,
  });

  await redisClient.set(rateLimitKey, "true", {
    ex: 10, // Rate limit: 10 seconds between OTP requests
  });

  const message = {
    to: email,
    subject: "Your otp code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  };

  await publishToQueue("send-otp", message);

  // DEBUG: Log OTP to console (remove in production)
  console.log(`📧 OTP for ${email}: ${otp}`);

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    res.status(400).json({
      message: "Email and OTP Required",
    });
    return;
  }

  const otpKey = `otp:${email}`;

  const storedOtp = await redisClient.get(otpKey);

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

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  if (!user) {
    const name = email.slice(0, 8);
    user = await User.create({ name, email });
  }


  const token = generateToken(user);

  res.json({
    message: "User Verified",
    user,
    token,
  });
});

export const myProfile = TryCatch<AuthenticatedRequest>(async (req, res) => {
  const user = req.user;

  res.json(user);
});

export const updateName = TryCatch<AuthenticatedRequest>(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404).json({
      message: "Please login",
    });
    return;
  }

  user.name = req.body.name;

  await user.save();

  const token = generateToken(user);

  res.json({
    message: "User Updated",
    user,
    token,
  });
});

export const getAllUsers = TryCatch<AuthenticatedRequest>(async (req, res) => {
  const users = await User.find();

  res.json(users);
});

export const getAUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.json(user);
});

// Google OAuth Callback Handler
export const googleAuthCallback = TryCatch<AuthenticatedRequest>(async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      message: "Authentication failed",
    });
    return;
  }

  const token = generateToken(user);

  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
});
