import express from 'express';
import passport from '../Controllers/passport.js';
import { register, login } from '../Controllers/authController.js';

const router = express.Router();

// Existing routes for email/password authentication
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  // Successful authentication
  res.redirect('http://localhost:3000/Profile'); // Redirect to your profile page or wherever you want
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
