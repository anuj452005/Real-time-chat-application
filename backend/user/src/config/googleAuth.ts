import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../model/User.js";

export const configureGoogleAuth = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return it
                        return done(null, user);
                    }

                    // Check if user exists with the same email
                    const email = profile.emails?.[0]?.value;
                    if (email) {
                        user = await User.findOne({ email });

                        if (user) {
                            // Link Google account to existing user
                            user.googleId = profile.id;
                            user.authProvider = "google";

                            // Update avatar if user doesn't have one
                            if (!user.avatar?.url && profile.photos?.[0]?.value) {
                                user.avatar = {
                                    url: profile.photos[0].value,
                                    publicId: "",
                                };
                            }

                            await user.save();
                            return done(null, user);
                        }
                    }

                    // Create new user
                    const newUser = await User.create({
                        googleId: profile.id,
                        name: profile.displayName || profile.emails?.[0]?.value.split("@")[0] || "User",
                        email: email || `${profile.id}@google.temp`,
                        authProvider: "google",
                        avatar: profile.photos?.[0]?.value
                            ? {
                                url: profile.photos[0].value,
                                publicId: "",
                            }
                            : undefined,
                    });

                    return done(null, newUser);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );

    // Serialize user for the session
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
