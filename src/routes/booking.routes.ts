
import { Router } from "express";
import {
  createBooking,
  getBookingById,
} from "../controllers/booking.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateUser, createBooking);
router.get("/:id", authenticateUser, getBookingById);

export default router;
