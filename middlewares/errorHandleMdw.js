const { CustomError } = require("../errors/customError");

const errorHandleMdw = (err, req, res, next) => {
   if (err instanceof CustomError) {
      const stack = err.stack
         .split("\n")
         .filter((line) => !line.match(/node_modules/))
         .join("\n");
      // console.log("*** err edit: ", err.status, err.message + "\n", stack);
      err.stack = stack;
      req.error = err;
      return res.status(err.status).send(err.message);
   } else {
      console.log(`  *** err 500: `, err);
      return res.status(500).json({ msg: "Something went wrong, please try again" });
   }
};

module.exports = { errorHandleMdw };
