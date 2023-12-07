import { Module } from "@nestjs/common";
import { HlrService } from "./hlr.service";

@Module({
  providers: [HlrService],
  exports: [HlrService],
})
export class HlrModule {}
