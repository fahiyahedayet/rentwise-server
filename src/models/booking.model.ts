
import { ObjectId } from "mongodb";

export interface Booking {
  _id?: ObjectId;
  customerId: string;
  equipmentId: string;
  equipmentName: string;
  customerName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  rentalType: string;
  duration: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}
