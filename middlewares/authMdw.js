const jwt = require("jsonwebtoken");
const { customError } = require("../errors/customError");
const User = require("../model/userModel");

const authMdw = (req, res, next) => {
   const bearerToken = req.headers.authorization;
    
   if (!bearerToken) return next(customError(401, "Missing JWT token"));
   const token = req.headers.authorization.split(" ")[1];

   jwt.verify(token, process.env.MY_PRIVATE_KEY, async (err, decoded) => { 
      if (err) return next(customError(401, "Invalid token"));  
      const user = await User.findById({ _id: decoded.userId });
 
      if (!user) return next(customError(401, "User existed"));
      req.user = user;
      next();
   });
};

module.exports = { authMdw };
