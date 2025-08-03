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
  Delete,
  DPayload,
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
import { InviteEmployeeDto } from "../user/user.dto";
import { IOrgResponse } from "./organisation.interface";

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

  @Post("register-admin-from-invite")
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

  @Post("invite-employee")
  @UseMiddleware(adminShield)
  @UseMiddleware(authShield)
  async inviteEmployee(
    @DBody(InviteEmployeeDto) body: InviteEmployeeDto,
    @DRes() res: Response
  ) {
    const result = await this.OrganisationService.inviteEmployee(body);
    SuccessResponse({ res, body: result });
  }

  @Post("register-employee-from-invite")
  async registerEmployeeFromInvite(
    @DBody(RegisterFromInviteDto) body: RegisterFromInviteDto,
    @DRes() res: Response
  ) {
    const { email, fullname, orgId, password, token, username } = body;
    const result = await this.OrganisationService.registerEmployeeFromInvite(
      token,
      orgId,
      email,
      password,
      fullname,
      username
    );
    SuccessResponse({ res, body: result });
  }

  @Post("logout")
  @UseMiddleware(authShield)
  async logout(@DRes() res: DResponse, @DReq() req: DRequest) {
    req.payload = {} as any;
    const result = await this.OrganisationService.logout(res);
    SuccessResponse({ res, body: result });
  }

  @Delete("")
  @UseMiddleware(adminShield)
  @UseMiddleware(authShield)
  async deleteAccount(
    @DRes() res: DResponse,
    @DPayload() payload: IPayload,
    @DReq() req: DRequest
  ) {
    const result = await this.OrganisationService.deleteOrg(res, payload.sub);
    req.payload = {} as any;
    SuccessResponse({ res, body: result });
  }

  @Get("balance")
  @UseMiddleware(authShield)
  async getBalance(@DRes() res: DResponse, @DPayload() payload: IPayload) {
    const result = await this.OrganisationService.getOrgBalance(
      (payload.info as IOrgResponse).orgId
    );

    SuccessResponse({ res, body: result });
  }

  @Post("test-payroll")
  @UseMiddleware(adminShield)
  @UseMiddleware(authShield)
  async testPayroll(@DRes() res: DResponse) {
    await this.OrganisationService.processPayroll();
    SuccessResponse({ res, body: { message: "Payroll processed manually" } });
  }
}
