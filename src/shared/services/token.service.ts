import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  InternalServerErrorException,
  IPayload,
  UnauthorizedException,
} from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import envConfig, { isProd } from "@/shared/configs/env.config";
import {
  generateJWTwithHMAC,
  verifyJWTwithHMAC,
} from "@dolphjs/dolph/utilities";
import { Response } from "express";

export class TokensService extends DolphServiceHandler<Dolph> {
  constructor() {
    super("tokensService");
  }

  async generateToken(userId: string) {
    const accessDuration = +envConfig.jwt.accessDuration;

    if (!accessDuration)
      throw new Error("Token expiration durations are not provided");

    const accessToken = this.signToken(
      userId,
      new Date(Date.now() + accessDuration * 1000)
    );

    return {
      accessToken,
      accessExpiration: new Date(Date.now() + accessDuration * 1000),
    };
  }

  private signToken(userId: string, expires: Date): string {
    const payload: IPayload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires.getTime() / 1000),
    };

    return generateJWTwithHMAC({ payload, secret: envConfig.jwt.secret });
  }

  async sendCookie(
    token: string,
    res: Response,
    body: any,
    redirectUrl?: string
  ): Promise<void> {
    const cookieOption: any = {
      expires: new Date(Date.now() + envConfig.jwt.accessDuration * 60 * 1000),
      httpOnly: true,
      secure: isProd(),
    };

    if (isProd()) {
      cookieOption.sameSite = "none";
    }

    res.cookie("Falcon", token, cookieOption);
    res.set("Cache-Control", "no-store");

    if (redirectUrl) {
      res.redirect(302, redirectUrl);
    } else {
      res.status(200).send(body);
    }
  }

  async clearCookie(res: Response): Promise<void> {
    res.clearCookie("Falcon", {
      httpOnly: true,
      secure: isProd(),
      sameSite: isProd() ? "none" : undefined,
    });
    res.clearCookie("OSetAccess", {
      httpOnly: true,
      secure: isProd(),
      sameSite: isProd() ? "none" : undefined,
    });
    res.set("Cache-Control", "no-store");
  }
}
