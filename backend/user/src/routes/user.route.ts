import express, { Router } from "express";
import {
    forgetPassword,
    getAllUsers,
    getMyProfile,
    getUserById,
    loginUser,
    updateProfile,
    verifyUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, updateSchema, verifySchema } from "../utils/validator.js";

const router: Router = express.Router();

router.post("/login", validate(loginSchema), loginUser);

router.post("/forgetPassword", validate(loginSchema), forgetPassword);

router.post("/verify", validate(verifySchema), verifyUser);

router.get("/myProfile", isAuth, getMyProfile);

router.patch(
    "/update/userProfile",
    isAuth,
    validate(updateSchema),
    updateProfile
);

router.get("/users/all", isAuth, getAllUsers);

router.get("/user/:id", getUserById);

export default router;
