var jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.headers["x-auth"];
  try {
    const tokenData = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {}
};
