import express from 'express';
import passport from '../Controllers/passport.js';
import { register, login, requestPasswordReset, resetPassword, verifyEmail } from '../Controllers/authController.js';

const router = express.Router();

// Existing routes for email/password authentication
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset-request', requestPasswordReset); // New route
router.post('/reset-password', resetPassword); // New route
router.get('/verify-email/:role/:token', verifyEmail);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// router.get('/google/callback', passport.authenticate('google'), (req, res) => {
//   // Successful authentication
//   res.redirect('https://www.putkoapp.online/Guest'); // Redirect to your profile page or wherever you want
// });

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Send the token and user data back to the client
    res.json({
      message: "Login successful",
      data: req.user.user,
      token: req.user.token,
      role: req.user.user.role,
    });

    res.redirect('https://www.putkoapp.online/Guest');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
