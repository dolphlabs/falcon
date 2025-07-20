import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo} from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { TransactionModel, ITransaction } from "./transaction.model";


@InjectMongo("transactionModel", TransactionModel)
export class TransactionService extends DolphServiceHandler<Dolph> {
  transactionModel!: Model<ITransaction>;

  constructor() {
    super("transactionservice");
  }
}
    
