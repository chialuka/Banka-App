import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  secure: false,
  auth: {
    user: 'chialukachiama@gmail.com',
    pass: 'A.D.3021-EU_acadAMUS',
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
