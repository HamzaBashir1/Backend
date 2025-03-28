import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import Host from "../models/Host.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  const { email, password, name, lastName, role, photo, gender, language, lang } = req.body;

  // Translation messages
  const messages = {
    en: {
      userExists: "User already exists",
      serverError: "Internal server error",
      success: "User successfully created",
    },
    sk: {
      userExists: "Používateľ už existuje",
      serverError: "Interná chyba servera",
      success: "Používateľ bol úspešne vytvorený",
    },
  };

  // Determine language (default to English)
  const t = messages[lang] || messages.sk;

  try {
    let existingUser = null;

    // Check for existing user in the appropriate collection
    if (role === "guest") {
      existingUser = await User.findOne({ email });
    } else if (role === "host") {
      existingUser = await Host.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: t.userExists });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user or host document based on the role
    let user;
    if (role === "guest") {
      user = new User({
        name,
        lastName,
        email,
        password: hashPassword,
        photo,
        gender,
        language,
        role,
      });
    } else if (role === "host") {
      user = new Host({
        name,
        lastName,
        email,
        password: hashPassword,
        photo,
        language,
        gender,
        role,
      });
    }

    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Set up transporter for sending email
    const transporter = nodemailer.createTransport({
      host: "smtp.websupport.sk", // WebSupport SMTP Server
      port: 465, // Use 465 (SSL) or 587 (TLS)
      secure: true, // True for SSL (465), False for TLS (587)
      auth: {
        user: "support@putko.sk", // Your WebSupport email
        pass: "Putko@786", // Use an environment variable instead of hardcoding
      },
    });

    // Verification link
    const verificationLink = `${process.env.CLIENT_SITE_URL}/verify-email/${role}/${verificationToken}`;

    // Email HTML Design
    const emailHTML = `
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f7f7f7; color: #333;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">

        <!-- Content Section -->
        <div style="padding: 24px; background-color: #fff;">

          <!-- Personal Greeting -->
          <p style="font-size: 18px; color: #333; margin: 0;">Dear User,</p>
          <p style="font-size: 16px; color: #555; margin-top: 8px;">Thank you for signing up! Please verify your email to complete the registration process.</p>

          <!-- Verification Link -->
          <div style="margin: 24px 0; text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #238869; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Your Email</a>
          </div>

          <p style="font-size: 16px;">If you did not sign up for this account, please ignore this email.</p>
          <p>Thank you for choosing Putko.</p>
          <p style="margin-top: 30px; font-size: 16px;">
            Best regards,<br />
            <strong>The Putko Support Team</strong>
          </p>
        </div>
      </div>
    </body>
    `;

    // Send verification email
    const mailOptions = {
      from: "support@putko.sk",
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: t.success });
  } catch (err) {
    res.status(500).json({ success: false, message: `${t.serverError}, ${err.message}`, });
  }
};

export const login = async (req, res) => {
  const { email, password, lang } = req.body; // Get language from request body

  // Define translations
  const messages = {
    en: {
      userNotFound: "User not found",
      verifyEmail: "Please verify your email first",
      invalidCredentials: "Invalid credentials",
      loginSuccess: "Successfully logged in",
      loginFailed: "Failed to login",
    },
    sk: {
      userNotFound: "Používateľ nebol nájdený",
      verifyEmail: "Najprv si overte svoj e-mail",
      invalidCredentials: "Neplatné poverenia",
      loginSuccess: "Úspešné prihlásenie",
      loginFailed: "Nepodarilo sa prihlásiť",
    },
  };

  // Determine language (default to English)
  const t = messages[lang] || messages.en;

  try {
    let user = null;

    const guest = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    const host = await Host.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (guest) {
      user = guest;
    }
    if (host) {
      user = host;
    }

    //check if user exist or not
    if (!user) {
      return res.status(404).json({ message: t.userNotFound });
    }

    // Ensure the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: t.verifyEmail });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ status: false, message: t.invalidCredentials });
    }

    // Generate authentication token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, role, booking, ...rest } = user._doc;

    res.status(200).json({ status: true, message: t.loginSuccess, token, data: { ...rest }, role });
  } catch (err) {
    res.status(400).json({ status: false, message: t.loginFailed });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email, role } = req.body;

  try {
    let user = null;

    const guest = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    const host = await Host.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (guest) {
      user = guest;
    }
    if (host) {
      user = host;
    }

    //check if user exist or not
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = generateToken(user);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.websupport.sk", // WebSupport SMTP Server
      port: 465, // Use 465 (SSL) or 587 (TLS)
      secure: true, // True for SSL (465), False for TLS (587)
      auth: {
        user: "support@putko.sk", // Your WebSupport email
        pass: "Putko@786", // Use an environment variable instead of hardcoding
      },
    });

    const mailOptions = {
      from: "support@putko.sk",
      to: email,
      subject: 'Password Reset',
      text: `Reset your password here: ${process.env.CLIENT_SITE_URL}/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

const sendResetSuccessEmail = async (userEmail) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.websupport.sk", // WebSupport SMTP Server
    port: 465, // Use 465 (SSL) or 587 (TLS)
    secure: true, // True for SSL (465), False for TLS (587)
    auth: {
      user: "support@putko.sk", // Your WebSupport email
      pass: "Putko@786", // Use an environment variable instead of hardcoding
    },
  });

  const mailOptions = {
    from: "support@putko.sk",
    to: userEmail,
    subject: 'Password Reset Successful',
    text: 'Your password has been reset successfully.',
  };

  await transporter.sendMail(mailOptions);
};

export const resetPassword = async (req, res) => {
  const { token, newPassword, role } = req.body;

  try {
    
    const user = role === "guest"
      ? await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
      : await Host.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};

export const changePassword = async (req, res) => {
  const { userId, newPassword, role } = req.body;

  try {
    // Find user based on role
    const user = role === "guest" 
      ? await User.findById(userId) 
      : await Host.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token, role } = req.params;

  try {
     // Verify the JWT token
     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
     console.log("Decoded ID:", decoded.id); // Log the decoded ID for debugging
 
     // Retrieve user based on role
     const user = role === "guest"
       ? await User.findById(decoded.id)
       : await Host.findById(decoded.id);
       console.log("Role:", role);
 
     // Check if user exists
     if (!user) {
       const roleMessage = role === "guest" ? 'Guest' : 'Host';
       return res.status(400).json({ message: `${roleMessage} user not found. Invalid verification link.` });
     }
 
     // Check if user is already verified
     if (user.isVerified) {
       return res.status(400).json({ message: 'User already verified' });
     }
 
     // Mark user as verified
     user.isVerified = true;
     await user.save();

     const transporter = nodemailer.createTransport({
      host: "smtp.websupport.sk", // WebSupport SMTP Server
      port: 465, // Use 465 (SSL) or 587 (TLS)
      secure: true, // True for SSL (465), False for TLS (587)
      auth: {
        user: "support@putko.sk", // Your WebSupport email
        pass: "Putko@786", // Use an environment variable instead of hardcoding
      },
    });

    // Set up email options
    const mailOptions = {
      from: "support@putko.sk", // Use environment variable
      to: user.email,
      subject: 'Email Verified Successfully',
      text: 'Your email has been successfully verified.',
    };

    // Send verification success email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Failed to verify email' });
  }
};
