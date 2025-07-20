import { Schema, Document, model } from "mongoose";

export interface ITransaction extends Document {
  
}

const TransactionSchema = new Schema(
    {

    }
);

export const TransactionModel = model<ITransaction>("transactions", TransactionSchema);
