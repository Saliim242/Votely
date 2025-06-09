import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  CONFITM_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./email.templates.js";
import { transporter } from "./nodmailer.config.js";
import dotenv from "dotenv";

dotenv.config();

// Send verification Code email when the user is registored
export const sendVerificationEmail = async (email, verificationCode) => {
  const recepient = [{ email }];
  console.log(recepient);
  console.log(verificationCode);
  try {
    const mailOptions = {
      from: `"Votely Support Team" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
    //   return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error Sending verification Email ${error}`);
  }
};
