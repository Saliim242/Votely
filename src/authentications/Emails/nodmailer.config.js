import nodmailer from "nodemailer";
import dotenv from "dotenv";

// Config the The Environment Variables
dotenv.config();

// Create The Nodmailer Transporter

export const transporter = nodmailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
