import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from './Controllers/passport.js';
import session from 'express-session';
import { Server } from "socket.io";
import http from 'http';
import authRoutes from './Routes/auth.js';
import adminRoutes from './Routes/adminRoutes.js';
import userRoutes from "./Routes/user.js";
import HostRoutes from './Routes/hostRoutes.js';
import InvoiceRoutes from './Routes/invoiceRoutes.js';
import accommodationRoutes from './Routes/AccommodationRoutes.js';
import messageRoutes from './Routes/message.js';
import Message from './models/messageModel.js';
import reviewRoutes from './Routes/ReviewRoutes.js';
import EmailRoutes from './Routes/EmailRoutes.js';
import ReservationRoutes from './Routes/ReservationRoutes.js';
import FavoriteRoutes from './Routes/FavoriteRoutes.js'
import BlogRoutes from "./Routes/BlogRoutes.js"
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const Port = process.env.Port || 8000;

app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as necessary
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// CORS Options
const corsOptions = {
  // origin: "https://putko-main.vercel.app", // Frontend origin
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Create the HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://www.putkoapp.online/",
    credentials: true,
  },
});

// Session and passport configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("MongoDB is connected");
  } catch (err) {
    console.log("MongoDB connection failed", err.message);
  }
};

// Test route to check if the API is working
app.get('/', (req, res) => {
  res.json({ message: "API is working" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', HostRoutes);
app.use('/api', InvoiceRoutes);
app.use('/api', accommodationRoutes);
app.use('/api', messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscribe", EmailRoutes);
app.use("/api/reservation", ReservationRoutes);
app.use("/api/favorite", FavoriteRoutes);
app.use("/api/blog", BlogRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for 'send_message' event from clients
  socket.on('send_message', async (msg) => {
    try {
      // Save the message to the database
      const newMessage = new Message({
        message: msg.message,
        sender: msg.sender,
        reciver:msg.reciver,
        users: msg.users,
      });
      // await newMessage.save();

      // Emit the message to all clients
      io.emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server using `server.listen`
server.listen(Port, () => {
  connectDB();
  console.log("Server is running on port " + Port);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
