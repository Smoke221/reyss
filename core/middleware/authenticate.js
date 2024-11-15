const jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: "Invalid token, please login again" });
      } else {
        const userID = decoded.id;
        req.userID = userID;
        next();
      }
    });
  } else {
    res.status(401).json({ msg: "Authorization token required" });
  }
};
module.exports = { authenticate };
