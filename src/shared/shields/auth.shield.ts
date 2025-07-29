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

const userService = new UserService();

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

    req.payload = {
      sub: user._id.toString(),
      info: orgUserData(await user.populate("org", "name admins"), user),
      exp: payload.exp,
      iat: payload.iat,
    };

    next();
  } catch (e) {
    next(new UnauthorizedException(e.message));
  }
};
