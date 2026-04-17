import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import Redis from "ioredis";
import { createHash } from "crypto";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy){
    
    constructor(
      private readonly configService: ConfigService,
      @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ){
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: (() => {
      const secret =
        configService.get<string>("JWT_SECRET") ??
        configService.get<string>("SECRET_KEY");
      if (!secret) {
        throw new Error("JWT secret missing. Set JWT_SECRET (or SECRET_KEY) in environment.");
      }
      return secret;
    })(),
    passReqToCallback: true,

  })
 }

async validate(req: any, payload: any) {
  const authHeader = req?.headers?.authorization ?? "";
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const blacklistKey = `jwt:blacklist:${tokenHash}`;
    const isBlacklisted = await this.redis.get(blacklistKey);
    if (isBlacklisted) {
      throw new UnauthorizedException("Token has been logged out");
    }
  }

  // The returned value becomes `req.user`
  return {
   userId: payload.userId,
   email:  payload.email,
   role:   payload.role
 }
}
}