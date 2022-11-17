const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./routes/user");
const { readSync, readdirSync } = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// const allowed = {
//   origin: "http://localhost:3000",
//   useSuccessStatus: 200,
// };
// const options = (req, res) => {
//   let temp;
//   let origin = req.header("Origin");
//   if (allowed.indexOf(origin) > -1) {
//     temp = {
//       origin: true,
//       optionSuccessStatus: 200,
//     };
//   } else {
//     temp = {
//       origin: "false",
//     };
//   }
//   res(null, temp);
// };

//dependencies
app.use(cors());
app.use(express.json());

//bodypraser middleware
app.use(bodyParser.json());

// dynamic routes import from routes folder
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// routers
// app.use("/api", userRouter);

app.get("/", (req, res) => {
  res.send("welcome from home");
});

// connect to data base
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is running on ${process.env.PORT}`);
});

// console.log((+new Date() * Math.random()).toString().substring(0, 1));
