
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { equipment } from "../data/equipment.js";
import { Booking } from "../models/booking.model.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const customerId = req.user.userId;

    const {
      equipmentId,
      customerName,
      email,
      phone,
      startDate,
      endDate,
      quantity,
    } = req.body;

    if (
      !equipmentId ||
      !customerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !startDate ||
      !endDate ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required.",
      });
    }

    const item = equipment.find(
      (item) => item.id === Number(equipmentId)
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found.",
      });
    }

    if (!item.available) {
      return res.status(400).json({
        success: false,
        message: "This equipment is currently unavailable.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid quantity.",
      });
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental dates.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    const difference = end.getTime() - start.getTime();

    const rentalType = item.rentalType.toLowerCase();

    const unit =
      rentalType === "hourly"
        ? 1000 * 60 * 60
        : rentalType === "weekly"
          ? 1000 * 60 * 60 * 24 * 7
          : rentalType === "monthly"
            ? 1000 * 60 * 60 * 24 * 30
            : 1000 * 60 * 60 * 24;

    const duration = Math.max(1, Math.ceil(difference / unit));

    const totalPrice = item.price * duration * quantity;

    const booking: Booking = {
      customerId,
      equipmentId: String(item.id),
      equipmentName: item.name,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      startDate,
      endDate,
      rentalType: item.rentalType,
      duration,
      quantity,
      pricePerUnit: item.price,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await getDB()
      .collection<Booking>("bookings")
      .insertOne(booking);

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully!",
      booking: {
        ...booking,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;

    if (typeof bookingId !== "string" || !ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await getDB()
      .collection<Booking>("bookings")
      .findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve booking.",
    });
  }
};
