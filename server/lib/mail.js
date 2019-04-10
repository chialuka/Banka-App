import nodemailer from 'nodemailer';
import config from '../config';

const { username, password } = config;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  secure: false,
  auth: {
    user: username,
    pass: password,
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
    from: '"Banka" chialukachiama@gmail.com',
    to: email,
    subject,
    html: message,
    ...rest,
  };
  return transporter.sendMail(newEmail);
}

export default sendMail;
