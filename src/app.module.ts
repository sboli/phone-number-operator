import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheModule } from "./cache/cache.module";
import { HlrModule } from "./hlr/hlr.module";

@Module({
  imports: [HlrModule, CacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
