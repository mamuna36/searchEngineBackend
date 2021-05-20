const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    token: {
      type: String,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);
// UserSchema.pre("save", async function (next) {
//   console.log("User", this);
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

UserSchema.pre("findOneAndUpdate", async function (next) {
  console.log("User", this);
  if (this._update.password)
    this._update.password = await bcrypt.hash(this._update.password, 10);
  next();
});

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = "auth";
};
module.exports = mongoose.model("User", UserSchema);
