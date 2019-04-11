import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const { USERNAME, PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  secure: false,
  auth: {
    user: USERNAME,
    pass: PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  logger: true,
  debug: true,
});

function sendMail({
  email,
  subject,
  message,
  ...rest
}) {
  const newEmail = {
    from: '"Banka Plc" bankanigeriaplc@gmail.com',
    to: email,
    subject,
    html: message,
    ...rest,
  };
  return transporter.sendMail(newEmail);
}

export default sendMail;
