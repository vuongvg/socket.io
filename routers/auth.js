const express = require("express");
const { loginCtrl, registerCtrl } = require("../controllers/authCtrl");
const { asyncWrapper } = require("../middlewares/asyncWrapper");
const router = express.Router();

router.post(
   "/login",
   asyncWrapper(async (req, res) => {
      const result = await loginCtrl(req.body.email, req.body.password);
      res.status(200).json(result);
   }) 
);

router.post(
   "/register",
   asyncWrapper(async (req, res) => {
      const result = await registerCtrl(req.body.email, req.body.password);
      res.status(201).json({ infoUser: { _id: result[0]._id, email: result[0].email } });
   })
);

module.exports = router;
