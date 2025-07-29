import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
} from "@dolphjs/dolph/common";
import { DBody, DRes, Get, Post, Route } from "@dolphjs/dolph/decorators";
import { LoginDto } from "../organisation/organisation.dto";
import { UserService } from "./user.service";
import { Response } from "express";

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
}
