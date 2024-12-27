import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import Host from '../models/Host.js';

passport.use(new GoogleStrategy({
  clientID: "951178339713-u813sl2r7vhnr6qh19a20c5qdkfm7k19.apps.googleusercontent.com", // Load from .env
  clientSecret: "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", // Load from .env
  callbackURL: "https://backend-1-yfnm.onrender.com/api/auth/google/callback",
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log("Access Token:", accessToken);
    console.log("Profile:", profile);

    const email = profile.emails && profile.emails[0]?.value;
    if (!email) {
      return done(new Error("No email found in profile"), null);
    }

    let existingUser = await Host.findOne({ email });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
      });
      return done(null, existingUser);
    }

    const newUser = new Host({
      email,
      name: profile.displayName,
      photo: profile._json.picture,
      role: 'host',
      gender: 'other',
      isVerified: true,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });
    return done(null, newUser);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Host.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
