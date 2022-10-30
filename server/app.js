const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  console.log(Object.keys(req.body)[0]);
  res.status(200).json([]);
});

app.listen(3000, () => {
  console.log("Server is running");
});
