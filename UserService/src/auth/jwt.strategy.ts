import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy){
    
 constructor(private readonly configService: ConfigService){
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: configService.getOrThrow<string>("SECRET_KEY"),

  })
 }

 async validate(payload: any) {
  // The returned value becomes `req.user`
  return {
   userId: payload.userId,
   email:  payload.email,
   role:   payload.role
 }
}
}