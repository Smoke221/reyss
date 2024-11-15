const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./dbUtils/db");
const userRouter = require("./routes/user");
const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Homepage");
});

app.use("/", userRouter);

app.get("/s", (req, res) => {
  res.send("Secured page.");
});

const PORT = process.env.PORT || 8090;
app.listen(PORT, async () => {
  try {
    await dbConnection;
    console.log("Connected to database");
  } catch (err) {
    console.log(err.message);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
