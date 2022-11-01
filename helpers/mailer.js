const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const dotenv = require("dotenv");
dotenv.config();

const { EMAIL, MAILING_ID, MAILING_REFRESH, MAILING_SECRET } = process.env;

const OAuthLink = "https://developers.google.com/oauthplayground";

const auth = new OAuth2(MAILING_ID, MAILING_SECRET, MAILING_REFRESH, OAuthLink);

exports.sendVerificationEmail = (email, name, url) => {
  auth.setCredentials({
    refresh_token: MAILING_REFRESH,
  });
  const accessToken = auth.getAccessToken();

  const stmp = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL,
      clientId: MAILING_ID,
      clientSecret: MAILING_SECRET,
      refreshToken: MAILING_REFRESH,
      accessToken,
    },
  });
  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Fakebook email verification",
    html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-weight:600;color:#3b5988">
    <img style="height:40px;width:40px;border-radius:50%" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHx8ow-fU7yYwRqbGZa6Gc8DTjRskzbdKIfYNzoL9D-4AIa6DQiwFtE0809_xEVFsw_KE&usqp=CAU" alt="" />
    <span>Action Request: Active your Fakebook Account</span>
    </div>
    <div style="padding:1rem;border-top:1px solid #093d52;border-bottom:1px solid #05385d">
    <span>Hello ${name}</span>
    </div>
    <div style="padding:20px">
    <span style="padding:1.5rem 0">You have created an Fakebook Account. To complete your registration,
    please confirm your account.</span>
    </div>
    <a style="width:200px;padding:10px 15px;background:rgba(0,0,255,0.833);color:white;text-decoration:none" href=${url}>Confirm Your Account</a>
    <br />
    <span style="margin-top:15px;display:inline-block">Stay connected with Fakebook.🙂</span>`,
  };
  stmp.sendMail(mailOptions, (err, res) => {
    if (err) {
      return err;
    }
    return res;
  });
};
