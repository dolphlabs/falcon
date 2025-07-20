import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse
} from "@dolphjs/dolph/common";
import { Get, Route } from "@dolphjs/dolph/decorators";

@Route('transaction')
export class TransactionController extends DolphControllerHandler<Dolph> {
  constructor() {
    super();
  }

  @Get("greet")
  async greet (req: DRequest, res: DResponse) {
    SuccessResponse({ res, body: { message: "you've reached the transaction endpoint." } });
  }
}
