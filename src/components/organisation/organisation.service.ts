import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import {
  BadRequestException,
  Dolph,
  ForbiddenException,
  NotFoundException,
} from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { OrganisationModel, IOrganisation } from "./organisation.model";
import { Pagination } from "mongoose-paginate-ts";
import { UserService } from "../user/user.service";
import {
  CreateOrgDto,
  InviteAdminDto,
  LoginDto,
  VerifyEmailDto,
} from "./organisation.dto";
import { Admin, roles, SuperAdmin } from "@/shared/constants/roles";
import { compareHashedString, hashString } from "@dolphjs/dolph/utilities";
import { MailSender } from "@/shared/senders/mail.sender";
import { generateOtp } from "@/shared/helpers/otp.helper";
import { TokensService } from "@/shared/services/token.service";
import { Response } from "express";
import { orgUserData } from "@/shared/helpers/serialise.helper";
import { createTreasuryWallet } from "@/shared/helpers/utils";
import envConfig from "@/shared/configs/env.config";
import { v4 as uuidV4 } from "uuid";
import { IToken, TokenModel } from "./token.model";

@InjectMongo("organisationModel", OrganisationModel)
@InjectMongo("tokenModel", TokenModel)
export class OrganisationService extends DolphServiceHandler<Dolph> {
  organisationModel!: Pagination<IOrganisation>;
  tokenModel!: Model<IToken>;
  UserService!: UserService;
  MailSender: MailSender;
  TokensService: TokensService;

  constructor() {
    super("organisationservice");
    this.UserService = new UserService();
    this.MailSender = new MailSender();
    this.TokensService = new TokensService();
  }

  async createOrg(dto: CreateOrgDto) {
    const organisation = await this.organisationModel.findOne({
      name: dto.orgName,
    });

    if (organisation)
      throw new BadRequestException("Organisation name already taken");

    const userByEmail = await this.UserService.fetchUser({ email: dto.email });

    if (userByEmail)
      throw new BadRequestException(
        "An account with this email already exists"
      );

    const userByUsername = await this.UserService.fetchUser({
      username: dto.username,
    });

    if (userByUsername)
      throw new BadRequestException("Username has been taken by another user");

    const org = await this.organisationModel.create({ name: dto.orgName });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 60 * 1000);

    const user = await this.UserService.createUser({
      email: dto.email,
      username: dto.username,
      role: [SuperAdmin, Admin],
      org: org._id,
      fullname: dto.fullname,
      password: await hashString(dto.password, 12),
      otp,
      otpExpiry,
    });

    this.MailSender.sendVerifyEmailOtpMail(user.email, otp, dto.orgName);

    return {
      message: "Otp has been sent to the proved email",
      data: user.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDto, res: Response) {
    let user = await this.UserService.fetchUser({
      email: dto.email,
      // roles: [SuperAdmin, Admin],
    });

    if (!user) throw new NotFoundException("Cannot find this account");

    let organisation = await this.organisationModel
      .findById(user.org)
      .populate("admins", "username fullname _id email image roles");

    if (!organisation)
      throw new NotFoundException(
        "No organisation associated with this account"
      );

    if (dto.code !== user.otp)
      throw new BadRequestException("Invalid or expired OTP");

    if (user.isVerified)
      throw new BadRequestException("Account has already been verified");

    const today = new Date();
    // if (new Date(today) < user.otpExpiry)
    //   throw new BadRequestException("Invalid or expired OTP");

    user.isVerified = true;
    user.otp = "";
    user.otpExpiry = null;
    organisation.isApproved = true;
    organisation.noOfEmployees = 1;
    organisation.admins = [user._id];

    // Todo: encrypt this key and decrypt it when needed
    organisation.entityKey = envConfig.circle.entityKey;

    await user.save();
    await organisation.save();

    if (!organisation.wallet?.walletSetId) {
      const { base, sol } = await createTreasuryWallet(organisation.name);

      organisation.chain = [base.blockchain, sol.blockchain];

      organisation.wallet = {
        baseAddress: base.address,
        solAddress: sol.address,
        baseBalance: "0.0000",
        solBalance: "0.0000",
        baseWalletId: base.id,
        solWalletId: sol.id,
        walletSetId: base.walletSetId,
      };

      await organisation.save();
    }

    const { accessToken } = await this.TokensService.generateToken(
      user._id.toString()
    );

    return this.TokensService.sendCookie(
      accessToken,
      res,
      orgUserData(organisation, user)
    );
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.UserService.fetchUser({ email: dto.email });

    if (!user) throw new BadRequestException("Invalid Credentials");

    if (!compareHashedString(dto.password, user.password))
      throw new BadRequestException("Invalid Credentials");

    if (!user.role.includes(Admin))
      throw new ForbiddenException("Only admin can access an organisation");

    const organisation = await this.organisationModel.findOne({
      _id: user.org,
    });

    if (!organisation)
      throw new NotFoundException(
        "Cannot find an organisation associated with this account"
      );

    if (!organisation.admins.includes(user._id))
      throw new ForbiddenException(
        "Cannot find an organisation associated with this account"
      );

    organisation.populate("admins", "image username email fullname _id role");

    const { accessToken } = await this.TokensService.generateToken(
      user._id.toString()
    );

    return this.TokensService.sendCookie(
      accessToken,
      res,
      orgUserData(organisation, user)
    );
  }

  async inviteAdmin(dto: InviteAdminDto) {
    const organisation = await this.organisationModel.findOne({
      _id: dto.organisationId,
      isDeleted: false,
    });

    if (!organisation) throw new NotFoundException("Organisation not found");

    const existingUser = await this.UserService.fetchUser({ email: dto.email });

    if (existingUser) {
      if (!organisation.admins.includes(existingUser._id)) {
        organisation.admins.push(existingUser._id);
        organisation.noOfEmployees += 1;
        await organisation.save();
      }
      return {
        message: "User added as admin to the organisation",
        data: { email: existingUser.email, userId: existingUser._id },
      };
    } else {
      const inviteToken = uuidV4();
      const inviteLink = `${
        envConfig.app.url
      }/register?token=${inviteToken}&orgId=${
        dto.organisationId
      }&email=${encodeURIComponent(dto.email)}`;

      await this.storeInviteToken(inviteToken, dto.email, dto.organisationId);

      this.MailSender.sendInviteEmail(dto.email, organisation.name, inviteLink);

      return {
        message: "Invite email sent with registration link",
        data: { email: dto.email },
      };
    }
  }

  private async storeInviteToken(token: string, email: string, orgId: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.tokenModel.create({ token, email, id: orgId, expiresAt });
    console.log(`Stored invite token ${token} for ${email} and org ${orgId}`);
  }

  async registerFromInvite(
    token: string,
    orgId: string,
    email: string,
    password: string,
    fullname: string,
    username: string
  ) {
    const invite = await this.verifyInviteToken(token, email, orgId);
    if (!invite)
      throw new BadRequestException("Invalid or expired invite link");

    const userByEmail = await this.UserService.fetchUser({ email });
    if (userByEmail) throw new BadRequestException("Email already registered");

    const userByUsername = await this.UserService.fetchUser({ username });
    if (userByUsername) throw new BadRequestException("Username taken");

    const organisation = await this.organisationModel.findById(orgId);
    if (!organisation) throw new NotFoundException("Organisation not found");

    const hashedPassword = await hashString(password, 12);

    const user = await this.UserService.createUser({
      email,
      username,
      role: [Admin],
      org: organisation._id,
      fullname,
      password: hashedPassword,
      isVerified: true,
    });

    organisation.admins.push(user._id);
    organisation.noOfEmployees += 1;
    await organisation.save();

    await this.removeInviteToken(token);

    return {
      message: "Account created and added as admin",
      data: { email: user.email, userId: user._id },
    };
  }

  private async verifyInviteToken(token: string, email: string, orgId: string) {
    const invite = await this.tokenModel.findOne({
      token,
      email,
      expiresAt: { $gt: new Date() },
      type: "INVITE",
    });
    return invite;
  }

  private async removeInviteToken(token: string) {
    await this.tokenModel.deleteOne({ token });
  }

  async fetchOrg(filter: any) {
    return this.organisationModel.findOne({ ...filter, isDeleted: false });
  }
}
