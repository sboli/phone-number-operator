import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HlrModule } from "./hlr/hlr.module";

@Module({
  imports: [HlrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
