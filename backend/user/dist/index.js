"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = __importDefault(require("./config/db.js"));
const redis_1 = require("@upstash/redis");
const user_js_1 = __importDefault(require("./routes/user.js"));
const rabbitmq_js_1 = require("./config/rabbitmq.js");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const googleAuth_js_1 = require("./config/googleAuth.js");
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
(0, db_js_1.default)();
(0, rabbitmq_js_1.connectRabbitMQ)();
exports.redisClient = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
console.log("✅ Redis client initialized (Upstash REST API)");
// Configure Google OAuth
(0, googleAuth_js_1.configureGoogleAuth)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Session middleware is required for Google OAuth state verification
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use("/api/v1", user_js_1.default);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
