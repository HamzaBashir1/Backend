// reviewJob.js
import cron from "node-cron";
import nodemailer from "nodemailer";
import Reservation from "../models/Reservation.js";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ reviewJob.js loaded");

let transporter = nodemailer.createTransport({
    host: "smtp.websupport.sk", // WebSupport SMTP Server
    port: 465, // Use 465 (SSL) or 587 (TLS)
    secure: true, // True for SSL (465), False for TLS (587)
    auth: {
      user: "support@putko.sk", // Your WebSupport email
      pass: "Putko@786", // Use an environment variable instead of hardcoding
    },
  });

export const startReviewJob = () => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      console.log("🔄 Running review cron...");
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const reservations = await Reservation.find({
        isApproved: "approved",
        reviewEmailSent: false, // ✅ only those not emailed
        checkOutDate: { $gte: startOfToday, $lt: startOfTomorrow },
      });

      for (const res of reservations) {
       const mailOptions = {
        from: "support@putko.sk",
        to: res.email, // ✅ send to guest’s email from reservation model
        subject: "⭐ We’d love your review!",
        text: `Hi ${res.name}, thanks for staying with us!`,

        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>We’d love your review</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding:30px 15px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
                    
                    <!-- Header -->
                    <tr>
                    <td align="center" style="background:#4CAF50;padding:20px;color:#ffffff;font-size:22px;font-weight:bold;">
                        Thank you for staying with us! 🌟
                    </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                    <td style="padding:30px;color:#333333;font-size:16px;line-height:1.6;">
                        <p>Hi <strong>${res.name}</strong>,</p>
                        <p>We hope you enjoyed your stay! Your opinion means a lot to us and helps future guests.</p>
                        <p>Please take a moment to share your review and rating.</p>

                        <!-- Button -->
                        <div style="text-align:center;margin:30px 0;">
                       <a href="${process.env.CLIENT_SITE_URL}/Review/${res.accommodationId.toString()}"
                            style="background:#4CAF50;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:16px;display:inline-block;">
                            Leave a Review
                        </a>
                        </div>

                        <p style="font-size:14px;color:#888888;">
                        Thank you for helping us improve! 💚<br/>
                        — The Putko Team
                        </p>
                    </td>
                    </tr>

                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
        `
        };



        await transporter.sendMail(mailOptions);
        console.log(`✅ Review email sent for ${res.name}`);

        // ✅ mark as sent
        res.reviewEmailSent = true;
        await res.save();
      }
    } catch (err) {
      console.error("❌ Error in review cron:", err);
    }
  });
};
