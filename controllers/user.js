const {
  validateEmail,
  validateLength,
  uniqueUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/token");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../helpers/mailer");
const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");
// dotenv.config();

const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid Email Address." });
    }

    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({ message: "User Already Exists." });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: "First Name must be between 3-30 characters." });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: "Last Name must be between 3-30 characters." });
    }

    if (!validateLength(password, 5, 30)) {
      return res
        .status(400)
        .json({ message: "Password must be between 5-30 characters." });
    }

    const cryptoPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;
    let newUsername = await uniqueUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      email,
      username: newUsername,
      password: cryptoPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );

    const url = `http://localhost:3000/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);

    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user?.picture,
      token: token,
      verified: user.verified,
      message: "Register Success. Please activate your email to start.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.body;

    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (check.verified === true) {
      return res
        .status(400)
        .send({ message: "This email is already activated." });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "Account has been activated successfully. " });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        message:
          "The email address you entered is not connected to an account.",
      });
    }

    const check = await bcrypt.compare(password, user.password);
    if (check) {
      const token = generateToken({ id: user._id.toString() }, "7d");
      res.send({
        id: user._id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        picture: user?.picture,
        token: token,
        verified: user.verified,
      });
    } else {
      return res.status(400).send({
        message: "Invalid email or password.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const auth = (req, res) => {
  res.send("Hello from auth");
};

module.exports = {
  register,
  activateAccount,
  login,
  auth,
};
