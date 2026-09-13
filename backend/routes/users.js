import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);

export default router;