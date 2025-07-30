import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
} from "@dolphjs/dolph/common";
import {
  DBody,
  DReq,
  DRes,
  Get,
  Post,
  Route,
  UseMiddleware,
} from "@dolphjs/dolph/decorators";
import { LoginDto } from "../organisation/organisation.dto";
import { UserService } from "./user.service";
import { Response } from "express";
import { authShield } from "@/shared/shields/auth.shield";

@Route("user")
export class UserController extends DolphControllerHandler<Dolph> {
  private UserService: UserService;
  constructor() {
    super();
  }

  @Post("signin")
  async login(@DBody(LoginDto) body: LoginDto, @DRes() res: Response) {
    await this.UserService.login(body, res);
  }

  @Post("logout")
  @UseMiddleware(authShield)
  async logout(@DRes() res: Response, @DReq() req: DRequest) {
    req.payload = {} as any;
    const result = await this.UserService.logout(res);
    SuccessResponse({ res, body: result });
  }
}
