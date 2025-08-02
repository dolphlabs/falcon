import { IUser } from "../user/user.model";
import { Role } from "@/shared/constants/roles";

export interface IOrg {
  orgId?: string;
  orgName?: string;
  noOfEmployees?: number;
  payDay?: number;
  isOrgDeleted?: boolean;
  logo?: string;
  admins?: IUser[];
}

export interface IUserResponse {
  organisation: IOrg;
  userId: string;
  username: string;
  fullname: string;
  email: string;
  image: string;
  position: string;
  role: Role[];
  salary: string;
  isUserVerified: boolean;
  isUserSuspended: boolean;
  userWalletAddress: string;
  userWalletAmount: string;
  chain: string;
  isUserDeleted: boolean;
}
