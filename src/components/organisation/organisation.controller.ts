import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
} from "@dolphjs/dolph/common";
import { DBody, DReq, DRes, Get, Post, Route } from "@dolphjs/dolph/decorators";
import { Request, Response } from "express";
import { OrganisationService } from "./organisation.service";
import { CreateOrgDto, LoginDto, VerifyEmailDto } from "./organisation.dto";

@Route("organisation")
export class OrganisationController extends DolphControllerHandler<Dolph> {
  private OrganisationService: OrganisationService;

  @Post("register")
  async register(
    @DBody(CreateOrgDto) body: CreateOrgDto,
    @DRes() res: Response
  ) {
    const result = await this.OrganisationService.createOrg(body);

    SuccessResponse({ res, body: result });
  }

  @Post("verify")
  async verifyEmail(
    @DBody(VerifyEmailDto) body: VerifyEmailDto,
    @DRes() res: Response
  ) {
    await this.OrganisationService.verifyEmail(body, res);
  }

  @Post("signin")
  async login(@DBody(LoginDto) body, @DRes() res: Response) {
    await this.OrganisationService.login(body, res);
  }
}
