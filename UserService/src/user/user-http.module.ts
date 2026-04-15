import { Module } from "@nestjs/common";
import { UserModuleModule } from "src/user-module/user-module.module";
import { UsercontrollerController } from "src/usercontroller/usercontroller.controller";
import { UserservicesService } from "src/userservices/userservices.service";

@Module({
    imports: [UserModuleModule],
    controllers: [UsercontrollerController],
    providers: [UserservicesService]
})

export class UserHttpModule {}