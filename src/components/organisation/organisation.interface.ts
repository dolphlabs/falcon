import { Chain } from "@/shared/constants/chains";
import { IUser } from "../user/user.model";
import { Role } from "@/shared/constants/roles";

export interface IOrgResponse {
  orgId: string;
  orgName: string;
  orgWalletAddress: string;
  orgWalletBalance: string;
  noOfEmployees: number;
  orgChain: Chain;
  payDay: number;
  isOrgDeleted: boolean;
  isOrgApproved: boolean;
  admins: IUser[];
  logo: string;
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
  isUserDeleted: boolean;
}
