
import { ObjectId } from "mongodb";

export type UserRole = "customer" | "owner" | "admin";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  photo: string;
  password?: string;
  googleId?: string;
  role: UserRole;
  createdAt: Date;
}
