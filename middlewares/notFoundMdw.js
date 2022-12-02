const { customError } = require("../errors/customError");

const notFoundMdw = (req, res, next) => {
   return  next(customError(404, "Router does not exist"));
};

module.exports = { notFoundMdw };
