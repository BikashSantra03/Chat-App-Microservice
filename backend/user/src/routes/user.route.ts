import express, { Router } from "express";
import {
    getMyProfile,
    loginUser,
    verifyUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router: Router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, getMyProfile);
export default router;
