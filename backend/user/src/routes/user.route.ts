import express, { Router } from "express";
import { loginUser, verifyUser } from "../controllers/user.controller.js";

const router: Router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
export default router;
