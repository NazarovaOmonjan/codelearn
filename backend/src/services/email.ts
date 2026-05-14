import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    // If SMTP not configured, just log the code
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[PASSWORD RESET] Code for ${email}: ${code}`);
      return true;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@codelearn.uz",
      to: email,
      subject: "CodeLearn - Сброс пароля",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">CodeLearn</h2>
          <p>Ваш код для сброса пароля:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Код действителен 15 минут. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
