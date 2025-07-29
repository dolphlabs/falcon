import { Document, model, Schema } from "mongoose";

export interface IToken extends Document {
  token: string;
  email: string;
  type: string;
  expiresAt: Date;
}

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["INVITE"],
      default: "INVITE",
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: false, versionKey: false }
);

tokenSchema.index({ token: 1, email: 1 }, { background: true });

export const TokenModel = model("tokens", tokenSchema);
