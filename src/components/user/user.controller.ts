import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  IPayload,
} from "@dolphjs/dolph/common";
import {
  DBody,
  DPayload,
  DReq,
  DRes,
  Get,
  Post,
  Route,
  UseMiddleware,
} from "@dolphjs/dolph/decorators";
import { LoginDto } from "../organisation/organisation.dto";
import { UserService } from "./user.service";
import { authShield } from "@/shared/shields/auth.shield";
import { AddWalletDto } from "./user.dto";
import { IUserResponse } from "./user.interface";
import { employeeData } from "@/shared/helpers/serialise.helper";
import { IOrganisation } from "../organisation/organisation.model";

@Route("user")
export class UserController extends DolphControllerHandler<Dolph> {
  private UserService: UserService;
  constructor() {
    super();
  }

  @Post("signin")
  async login(@DBody(LoginDto) body: LoginDto, @DRes() res: DResponse) {
    await this.UserService.login(body, res);
  }

  @Post("logout")
  @UseMiddleware(authShield)
  async logout(@DRes() res: DResponse, @DReq() req: DRequest) {
    req.payload = {} as any;
    const result = await this.UserService.logout(res);
    SuccessResponse({ res, body: result });
  }

  @Post("add-wallet")
  @UseMiddleware(authShield)
  async addWallet(
    @DRes() res: DResponse,
    @DPayload() payload: IPayload,
    @DBody(AddWalletDto) body: AddWalletDto
  ) {
    const result = await this.UserService.addWallet(
      body,
      payload.info as IUserResponse
    );

    SuccessResponse({ res, body: employeeData(result, {} as IOrganisation) });
  }
}
