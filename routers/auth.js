import { Router } from "express";
import { collection, validate1 } from "../src/mongodb.js";
import lodash from "lodash";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../services/token.js";
const router = Router();

router.get("/Login", (req, res) => {
  if (req.cookies.token) {
    res.redirect("/");
    return;
  }
  res.status(200).render("Login", { title: "Login User", isLogin: true });
});

router.get("/Register", (req, res) => {
   if (req.cookies.token) {
    res.redirect("/");
    return;
  }
  res
    .status(200)
    .render("Register", { title: "Register User", isRegister: true });
});

router.post("/register", async (req, res) => {
  const { error } = validate1(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let user = await collection.findOne({ email: req.body.email });
  if (user) {
    return res.status(404).send("Bu emaildan oldin ro'yhatdan o'tilgan");
  }
  user = new collection(
    lodash.pick(req.body, ["FirstName", "LastName", "password", "email"])
  );
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);
  try {
    const UserT = await user.save();
    const token = generateJWTToken(UserT._id);
    res.cookie("token", token, { httpOnly: true, secure: true });
    return res.redirect("/");
  } catch {
    return res.status(400).send("Have error with saved");
  }
});

//LogOut
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/Register");
});

router.post("/login", async (req, res) => {
  try {
    const { error } = validate1(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const user = await collection.findOne({ email: req.body.email });
    const token = generateJWTToken(user._id);
    res.cookie("token", token, { httpOnly: true, secure: true });
    if (!user) {
      return res.status(404).send("Email or Password error");
    }
    const isvalidate = await bcrypt.compare(req.body.password, user.password);
    if (isvalidate) {
      return res.redirect("/");
    } else {
      return res.status(404).send("Email or Password error");
    }
  } catch {
    return res.status(400).send("Have error with saved");
  }
});

export default router;
