import { Role, roles } from "@/shared/constants/roles";
import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  fullname: string;
  email: string;
  password: string;
  image: string;
  position: string;
  role: Role[];
  org: Types.ObjectId;
  salary: string;
  isVerified: boolean;
  otp: string;
  otpExpiry: Date;
  isSuspended: boolean;
  walletAddress: string;
  walletAmount: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    position: {
      type: String,
    },
    role: {
      type: [String],
      enum: roles,
    },
    salary: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    walletAddress: {
      type: String,
    },
    walletAmount: {
      type: String,
    },
    org: {
      type: Types.ObjectId,
      ref: "organisations",
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.plugin(mongoosePagination);

export const UserModel: Pagination<IUser> = model<IUser, Pagination<IUser>>(
  "users",
  UserSchema
);
