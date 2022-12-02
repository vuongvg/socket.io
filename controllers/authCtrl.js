const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { customError } = require("../errors/customError");
const User = require("../model/userModel");

const loginCtrl = async (email, password) => {
   if (!email || !password) throw customError(400, "The email address or password is required");
   const existedUser = await User.findOne({ email: email });

   if (!existedUser) throw customError(400, "The email address or password is incorrect");
   // const { hashedPassword } = encryptPassword(password, existedUser.salt);
   const hashedPassword = crypto.pbkdf2Sync(password, existedUser.salt, 10000, 64, "sha512").toString("hex");

   if (hashedPassword !== existedUser.hashedPassword) throw customError(400, "The email address or password is incorrect");

   const token = jwt.sign(
      {
         userId: existedUser._id, 
      },
      process.env.MY_PRIVATE_KEY,
      {
         expiresIn: +process.env.EXPIRES_TOKEN,
      }
   );

   const refreshToken = jwt.sign(
      {
         userId: existedUser._id,
      },
      process.env.REFRESH_TOKEN_KEY,
      {
         expiresIn: +process.env.EXPIRES_REFRESH_TOKEN,
      }
   ); 

   return { token, refreshToken, user: { ...existedUser._doc, salt: undefined, hashedPassword: undefined } };
};

const registerCtrl = async (email, password) => {
   if (!/^(?=\S*[a-z]|\d)(?=\S*[A-Z])(?=\S*[^\w\s])\S{8,}$/.test(password))
      throw customError(400, "Password containing at least 1 uppercase, 1 lowercase, 1 special character");

   if (!email || !password) throw customError(400, "The email address or password is required");
   const existedUser = await await User.findOne({ email });

   if (existedUser) throw customError(400, "Email is existed!");
   // const { salt, hashedPassword } = encryptPassword(password);
   const salt = crypto.randomBytes(64).toString("hex");
   const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");

   return User.create([{ email, salt, hashedPassword }]);
};

const encryptPassword = (password, saltDB) => {
   const salt = saltDB || crypto.randomBytes(64).toString("hex");
   const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
   return { salt, hashedPassword };
};

module.exports = { loginCtrl, registerCtrl };
