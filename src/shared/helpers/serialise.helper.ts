import { IOrgResponse } from "@/components/organisation/organisation.interface";
import { IOrganisation } from "@/components/organisation/organisation.model";
import { IUser } from "@/components/user/user.model";

export const orgUserData = (org: IOrganisation, user: IUser) => {
  const result: IOrgResponse = {
    admins: org.admins as unknown as IUser[],
    email: user.email,
    fullname: user.fullname,
    image: user.image,
    isOrgApproved: org.isApproved,
    isOrgDeleted: org.isDeleted,
    isUserDeleted: user.isDeleted,
    isUserSuspended: user.isSuspended,
    isUserVerified: user.isVerified,
    logo: org.logo,
    noOfEmployees: org.noOfEmployees,
    orgChain: org.chain,
    orgId: org._id.toString(),
    orgName: org.name,
    orgWalletAddress: org.walletAddress,
    orgWalletBalance: org.walletBalance,
    payDay: org.payDay,
    position: user.position,
    role: user.role,
    salary: user.salary,
    userId: user._id.toString(),
    username: user.username,
    userWalletAddress: user.walletAddress,
    userWalletAmount: user.walletAmount,
  };

  return result;
};
