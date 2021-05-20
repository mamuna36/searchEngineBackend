module.exports = (req, res, next) => {
  req.id = req.body.id;
  next();
};
