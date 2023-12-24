const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASS } = process.env;

const config = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "andsnk@meta.ua",
    pass: META_PASS,
  },
};

const transporter = nodemailer.createTransport(config);

const sendEmail = async (data) => {
  const emailOptions = { ...data, from: "andsnk@meta.ua" };
  const info = await transporter.sendMail(emailOptions);
  console.log("Email send success", info);
  return info;
};

// const sendEmail = async (data) => {
//   const emailOptions = { ...data, from: "andsnk@meta.ua" };
//   try {
//     const info = await transporter.sendMail(emailOptions);
//     console.log("Email send success", info);
//     return info;
//   } catch (error) {
//     console.error("Error sending email", error.message);
//     throw error;
//   }
// };

module.exports = sendEmail;
