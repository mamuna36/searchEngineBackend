const User = require("../models/User");
const createError = require("http-errors");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const tokens = {};

// get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort("lastName")
      .limit(5);
    res.status(200).send(users);
  } catch (e) {
    next(e);
  }
};

// get one specific user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) throw new createError.NotFound();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

// delete one specific user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new createError.NotFound();
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

// updating one user
exports.updateUser = async (req, res, next) => {
  const token = req.headers["x-auth"];
  const userData = req.body;
  // is the request coming from a logged in user?
  // Find the user with provided key, the convention is send the key in the header
  //const loggedInUser = await User.findOne({ token: token });
  const loggedInUser = await User.findOne({ token: token });
  console.log("loggedInUser", loggedInUser);
  if (!token || !loggedInUser) {
    return next({ message: "Permission denied. You have to log in." });
  }
  //encrypt password
  userData.password = await bcrypt.hash(userData.password, 10);
  try {
    const user = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new createError.NotFound();
    next();
    //res.status(200).send(user);
  } catch (e) {
    next(e);
  }
};

// adding a new user
exports.addUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new User(req.body);
    const token = crypto.randomBytes(30).toString("hex");
    //encrypt password
    user.password = await bcrypt.hash(user.password, 10);
    user.token = token;
    await user.save();
    res.set({ "x-auth": token }).status(200).json(user);
  } catch (e) {
    next(e);
  }
};

// login user
exports.loginUser = async (req, res, next) => {
  const userCredentials = req.body;
  const inputPassword = userCredentials.password;
  // get user from database
  const foundUser = await User.findOne({ email: userCredentials.email }).select(
    "+password"
  );
  const password = foundUser.password;
  const isCorrectPassword = await bcrypt.compare(inputPassword, password);
  console.log(foundUser);
  if (!foundUser) {
    res.json({ error: "User not found" });
  } else if (isCorrectPassword) {
    //generate random string using built in library crypto
    const token = crypto.randomBytes(30).toString("hex");

    // store key in our db entry
    await User.findByIdAndUpdate(foundUser.id, { token: token });
    //await User.findByIdAndUpdate(foundUser.id, { token });
    res
      .set({ "x-auth": token })
      .json({ status: "logged in", token: token })
      .send(foundUser);
  } else {
    res.json({ error: "Wrong password" });
  }
};
