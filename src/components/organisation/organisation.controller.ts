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
  Shield,
  UseMiddleware,
} from "@dolphjs/dolph/decorators";
import { Request, Response } from "express";
import { OrganisationService } from "./organisation.service";
import {
  CreateOrgDto,
  InviteAdminDto,
  LoginDto,
  RegisterFromInviteDto,
  VerifyEmailDto,
} from "./organisation.dto";
import { authShield } from "@/shared/shields/auth.shield";
import { adminShield } from "@/shared/shields/admin.shield";

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

  @Post("invite-admin")
  @UseMiddleware(adminShield)
  @UseMiddleware(authShield)
  async inviteAdmin(
    @DBody(InviteAdminDto) body: InviteAdminDto,
    @DRes() res: Response
  ) {
    const result = await this.OrganisationService.inviteAdmin(body);
    SuccessResponse({ res, body: result });
  }

  @Post("register-from-invite")
  async registerFromInvite(
    @DBody(RegisterFromInviteDto) body: RegisterFromInviteDto,
    @DRes() res: Response
  ) {
    const { email, fullname, orgId, password, token, username } = body;
    const result = await this.OrganisationService.registerFromInvite(
      token,
      orgId,
      email,
      password,
      fullname,
      username
    );
    SuccessResponse({ res, body: result });
  }
}
