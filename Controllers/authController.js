import User from "../models/User.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;

  try {
    // Check if user exists (case-insensitive)
    let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    // Check if user exists
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashPassword,
      photo,
      gender,
      role,
    });

    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Set up transporter for sending email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "sharjeelsohail279@gmail.com",
        pass: "iyip nosn bwem gwer",
      },
    });

    // Verification link
    const verificationLink = `${process.env.CLIENT_SITE_URL}/verify-email/${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: "sharjeelsohail279@gmail.com",
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "User successfully created" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    // Find user case-insensitively
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    const { password: userPassword, ...userData } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      token,
      data: userData,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to login" });
  }
};

// Function to request password reset
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = generateToken(user);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

        await user.save();

        // Send email
        let transporter = nodemailer.createTransport({
          service: 'gmail', // or other email service like SendGrid, Mailgun, etc.
          auth: {
            user: "sharjeelsohail279@gmail.com", // Your email address
            pass: "iyip nosn bwem gwer", // Your email password or app-specific password
          },
        });

        const mailOptions = {
            from: "sharjeelsohail279@gmail.com",
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link to reset your password:\n\n` +
                  `${process.env.CLIENT_SITE_URL}/reset-password/${resetToken}\n\n` +
                  `If you did not request this, please ignore this email.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
      console.error("Error requesting password reset:", err);
      res.status(500).json({ message: 'Error requesting password reset' });
    }
  
};

// Function to send a notification email
const sendResetSuccessEmail = async (userEmail) => {
  const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service provider
      auth: {
          user: 'sharjeelsohail279@gmail.com', // Your email address
          pass: 'iyip nosn bwem gwer', // Your email password or app-specific password
      },
  });

  const mailOptions = {
      from:"sharjeelsohail279@gmail.com",
      to: userEmail,
      subject: 'Password Reset Successful',
      text: 'Your password has been reset successfully. If you did not request this change, please contact support.',
  };

  await transporter.sendMail(mailOptions);
};

// Function to reset password
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined; // Clear the token
        user.resetPasswordExpires = undefined; // Clear expiration

        await user.save();

        // Send success notification email
        await sendResetSuccessEmail(user.email);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    user.isVerified = true;
    await user.save();

    // Send a success email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "sharjeelsohail279@gmail.com",
        pass: "iyip nosn bwem gwer",
      },
    });

    const mailOptions = {
      from: "sharjeelsohail279@gmail.com",
      to: user.email,
      subject: 'Email Verified Successfully',
      text: 'Your email has been successfully verified.',
    };

    await transporter.sendMail(mailOptions);

    // Redirect to login
    res.redirect(`${process.env.CLIENT_SITE_URL}/login`);
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify email' });
  }
};
