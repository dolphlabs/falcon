import { Component } from "@dolphjs/dolph/decorators";
import { TransactionController } from "./transaction.controller";

@Component({ controllers: [TransactionController], services: [] })
export class TransactionComponent {}
