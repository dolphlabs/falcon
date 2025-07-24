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
import { CreateOrgDto, LoginDto, VerifyEmailDto } from "./organisation.dto";
import { Admin, roles, SuperAdmin } from "@/shared/constants/roles";
import { compareHashedString, hashString } from "@dolphjs/dolph/utilities";
import { MailSender } from "@/shared/senders/mail.sender";
import { generateOtp } from "@/shared/helpers/otp.helper";
import { TokensService } from "@/shared/services/token.service";
import { Response } from "express";
import { orgUserData } from "@/shared/helpers/serialise.helper";
import {
  createTreasuryWallet,
  generateOrgEntityKey,
} from "@/shared/helpers/utils";

@InjectMongo("organisationModel", OrganisationModel)
export class OrganisationService extends DolphServiceHandler<Dolph> {
  organisationModel!: Pagination<IOrganisation>;
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

    const today = new Date();
    // if (new Date(today) < user.otpExpiry)
    //   throw new BadRequestException("Invalid or expired OTP");

    user.isVerified = true;
    organisation.isApproved = true;
    organisation.noOfEmployees = 1;
    organisation.admins = [user._id];

    // Todo: encrypt this key and decrypt it when needed
    organisation.entityKey = generateOrgEntityKey();

    await user.save();
    await organisation.save();

    const wallet = await createTreasuryWallet(
      organisation.name,
      organisation.entityKey,
      organisation.id.toString()
    );

    console.log("Wallet: ", wallet);

    organisation.walletAddress = wallet.address;
    await organisation.save();

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

  async fetchOrg(filter: any) {
    return this.organisationModel.findOne({ ...filter, isDeleted: false });
  }
}
