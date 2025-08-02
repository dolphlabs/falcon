import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import {
  BadRequestException,
  Dolph,
  ForbiddenException,
} from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { UserModel, IUser } from "./user.model";
import { Pagination } from "mongoose-paginate-ts";
import { LoginDto } from "../organisation/organisation.dto";
import { compareHashedString } from "@dolphjs/dolph/utilities";
import { Admin } from "@/shared/constants/roles";
import { TokensService } from "@/shared/services/token.service";
import { employeeData, orgUserData } from "@/shared/helpers/serialise.helper";
import { Response } from "express";
import { IOrganisation } from "../organisation/organisation.model";
import { OrganisationService } from "../organisation/organisation.service";
import { AddWalletDto } from "./user.dto";
import { IUserResponse } from "./user.interface";
import { chainsMap } from "@/shared/helpers/chains.helper";
import { createUserWallet, getWalletBalances } from "@/shared/helpers/utils";
import { Blockchain } from "@circle-fin/developer-controlled-wallets";

@InjectMongo("userModel", UserModel)
export class UserService extends DolphServiceHandler<Dolph> {
  userModel!: Pagination<IUser>;
  TokensService: TokensService;

  constructor() {
    super("userservice");
    this.TokensService = new TokensService();
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.fetchUser({ email: dto.email });

    if (!user) throw new BadRequestException("Invalid Credentials");

    if (!compareHashedString(dto.password, user.password))
      throw new BadRequestException("Invalid Credentials");

    if (user.role.includes(Admin))
      throw new ForbiddenException("Only employee can access this resource");

    const { accessToken } = await this.TokensService.generateToken(
      user._id.toString()
    );

    return this.TokensService.sendCookie(
      accessToken,
      res,
      employeeData(user, { _id: user.org } as unknown as IOrganisation)
    );
  }

  async logout(res: Response) {
    try {
      await this.TokensService.clearCookie(res);
      return { message: "Successfully logged out" };
    } catch (error) {
      throw new BadRequestException("Failed to log out");
    }
  }

  async addWallet(dto: AddWalletDto, user: IUserResponse) {
    let chainAddress = "";

    const chainKey = dto.chain.toUpperCase() as keyof typeof chainsMap;

    if (chainsMap[chainKey]) {
      chainAddress = chainsMap[chainKey];
    }

    if (!chainAddress.length)
      throw new BadRequestException(
        "The blockchain you attempt to add is not supported yet"
      );

    const wallet = await createUserWallet(
      user.username || user.fullname,
      dto.chain as unknown as Blockchain
    );

    return this.userModel.findOneAndUpdate(
      { _id: user.userId },
      {
        walletAddress: wallet.address,
        chain: chainKey,
        tokenAddress: chainAddress,
        walletAmount: "0.0000",
        walletId: wallet.id,
        walletSetId: wallet.walletSetId,
      },
      { new: true }
    );
  }

  private async fetchWalletBalance(
    address: string,
    blockchain: any,
    tokenAddress?: string
  ): Promise<string> {
    return getWalletBalances(address, blockchain, tokenAddress);
  }

  createUser(dto: Partial<IUser>) {
    return this.userModel.create(dto);
  }

  fetchUser(filter: any) {
    return this.userModel.findOne({ ...filter, isDeleted: false });
  }
}
