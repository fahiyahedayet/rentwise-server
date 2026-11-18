
import { ObjectId } from "mongodb";

export interface Booking {
  _id?: ObjectId;
  equipmentId: string;
  customerName: string;
  email: string;
  phone: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  duration: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}
