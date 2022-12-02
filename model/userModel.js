const { default: mongoose } = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
   {
      email: {
         type: String,
         trim: true,
         required: [true, "Invalid Email"],
         minlength: [8, "Name can not be less than 8 characters"],
         maxlength: [50, "Name can not be more than 50 characters"],
         validate: {
            validator: (email) => {
               return validator.isEmail(email, { allow_utf8_local_part: false });
            },
            message: "Invalid Email",
         },
      },
      salt: { type: String, required: true },
      hashedPassword: { type: String, required: true },
   },
   { timestamps: true, versionKey: false }
);

const User = new mongoose.model("User", userSchema);

module.exports = User;
