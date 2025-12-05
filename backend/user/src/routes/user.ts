import express from "express";
import passport from "passport";
import {
  getAllUsers,
  getAUser,
  loginUser,
  myProfile,
  updateName,
  verifyUser,
  googleAuthCallback,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// Debug route
router.get("/test-auth", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

// Email/OTP Authentication Routes
router.post("/login", loginUser);
router.post("/verify", verifyUser);

// Google OAuth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) as any
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }) as any,
  googleAuthCallback as any
);

// Protected Routes
router.get("/me", isAuth as any, myProfile as any);
router.get("/user/all", isAuth as any, getAllUsers as any);
router.get("/user/:id", getAUser);
router.post("/update/user", isAuth as any, updateName as any);

export default router;
