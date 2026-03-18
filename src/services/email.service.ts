import nodemailer from "nodemailer";
import cors from "cors";
import express, { Express } from "express";
import env from "dotenv";

env.config();
const app: Express = express();
app.use(cors());
app.use(express.json());

async function sendConfirmationEmail(
  to: String,
  subject?: string,
  customHtml?: string,
) {
  if (!to) {
    throw new Error("Missing requirements");
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const html =
      customHtml ||
      `
      <h1>BuildX Designer</h1>
      <p>Your email has been recorded! We will reply to you shortly.</p>
    `;

    const mailSubject = subject || "BuildX Designer";
    await transporter.sendMail({
      to: to.toString(),
      subject: mailSubject,
      html: html,
    });
  } catch (error) {
    throw new Error("Failed to create transporter");
  }
}

async function recordEmail(subject: String, from: String, text: String) {
  if (!subject || !from || !text) {
    throw new Error("Missing requirements");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const html = `
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: hsl(0, 0%, 95%);
                        padding: 20px;
                        border-radius: 8px;
                        border: 1px solid hsla(189, 100%, 77%, 1.00);;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>A user has sent an email!</h1>
                    <hr>
                    <h2>${subject}</h2>
                    <h3>From: ${from}</h3>
                    <hr>
                    <p>${text}</p>
                </div>
            </body>
        `;

    await transporter.sendMail({
      from: from.toString(),
      to: process.env.TEAM_EMAIL,
      subject: subject.toString(),
      text: text.toString(),
      html: html.toString(),
    });
  } catch (error) {
    throw new Error("Failed to create transporter");
  }
}

export { sendConfirmationEmail, recordEmail };
