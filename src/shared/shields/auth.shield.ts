import {
  DNextFunc,
  DRequest,
  DResponse,
  ForbiddenException,
  UnauthorizedException,
} from "@dolphjs/dolph/common";
import { verifyJWTwithHMAC } from "@dolphjs/dolph/utilities";
import envConfig from "../configs/env.config";
import { UserService } from "@/components/user/user.service";
import { orgUserData } from "../helpers/serialise.helper";
import { OrganisationService } from "@/components/organisation/organisation.service";
import { IOrganisation } from "@/components/organisation/organisation.model";

const userService = new UserService();
const orgService = new OrganisationService();

export const authShield = async (
  req: DRequest,
  res: DResponse,
  next: DNextFunc
) => {
  try {
    const authToken = req.cookies?.Falcon || (req.cookies?.falcon as string);

    if (!authToken) {
      return next(
        new UnauthorizedException("No authentication cookie provided")
      );
    }

    const payload = verifyJWTwithHMAC({
      token: authToken,
      secret: envConfig.jwt.secret,
    });

    if (!payload) {
      return next(new UnauthorizedException("Invalid or expired token"));
    }

    const user = await userService.fetchUser({ _id: payload.sub });

    if (!user) {
      return next(
        new ForbiddenException("Cannot find this authenticated account")
      );
    }

    const org = await orgService.fetchOrg({ _id: user.org });

    req.payload = {
      sub: user._id.toString(),
      info: orgUserData(org || ({} as IOrganisation), user),
      exp: payload.exp,
      iat: payload.iat,
    };

    next();
  } catch (e) {
    next(new UnauthorizedException(e.message));
  }
};
