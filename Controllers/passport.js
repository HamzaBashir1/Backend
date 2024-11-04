import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js'; // Adjust the path as necessary

passport.use(new GoogleStrategy({
  clientID: "951178339713-u813sl2r7vhnr6qh19a20c5qdkfm7k19.apps.googleusercontent.com", // Ensure this is defined in .env
  clientSecret: "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", // Ensure this is defined in .env
  callbackURL: "https://backend-gd0n.onrender.com/api/auth/google/callback"
},

async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Check if email is verified
      if (!user.isVerified) {
        return done(null, false, { message: "Please verify your email first" });
      }
      return done(null, user);
    }

    // Create a new user if not exists and send verification email
    user = new User({
      email: profile.emails[0].value,
      name: profile.displayName,
      photo: profile._json.picture, // Save profile picture URL
      role: 'guest', // Default role for new users
      gender: 'other', // Default gender for new users
      isVerified: false // Set to false initially until verified
    });
    await user.save();

    // Generate verification token and send email
    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const verificationLink = `${process.env.CLIENT_SITE_URL}/verify-email/guest/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "sharjeelsohail279@gmail.com",
        pass: "iyip nosn bwem gwer",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationLink}`
    };

    await transporter.sendMail(mailOptions);

    return done(null, false, { message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
