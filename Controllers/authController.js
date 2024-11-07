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
  const { email, password, name, role, photo, gender } = req.body;

  try {
    let existingUser = null;

    // Check for existing user in the appropriate collection
    if (role === "guest") {
      existingUser = await User.findOne({ email });
    } else if (role === "host") {
      existingUser = await Host.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user or host document based on the role
    let user;
    if (role === "guest") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    } else if (role === "host") {
      user = new Host({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

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
    const verificationLink = `${process.env.CLIENT_SITE_URL}/verify-email/${role}/${verificationToken}`;

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

    // Ensure the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

   //compare password
   const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);

   if (!isPasswordMatch) {
     return res.status(400).json({ status: false, message: "Invalid credential" });
   }

    // Generate authentication token
    const token = generateToken(user);

    // Remove password from response
    const { password, role, booking, ...rest } = user._doc;

    res.status(200).json({ status: true, message: "Successfully login", token, data: { ...rest }, role });
  } catch (err) {
    res.status(400).json({ status: false, message: "Failed to login" });
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
      service: 'gmail',
      auth: {
        user: "sharjeelsohail279@gmail.com",
        pass: "iyip nosn bwem gwer",
      },
    });

    const mailOptions = {
      from: "sharjeelsohail279@gmail.com",
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
    service: 'gmail',
    auth: {
      user: 'sharjeelsohail279@gmail.com',
      pass: 'iyip nosn bwem gwer',
    },
  });

  const mailOptions = {
    from: "sharjeelsohail279@gmail.com",
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
      service: 'gmail',
      auth: {
        user: "sharjeelsohail279@gmail.com",
        pass: "iyip nosn bwem gwer",
      },
    });

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Use environment variable
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
