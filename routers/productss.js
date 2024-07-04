import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).render("index", { title: "Booom Shop" });
});

router.get("/Products", (req, res) => {
  res.status(200).render("Products", { title: "Products", isPruductss: true });
});

router.get("/Add", (req, res) => {
  res.status(200).render("Add", { title: "Add Products", isAdd: true });
});

export default router;
