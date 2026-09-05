import { Module } from "@nestjs/common";
import { BalanceController } from "./balance.controller";
import { BalanceService } from "./balance.service";
import { BALANCE_PROVIDER } from "./balance.provider";
import { RpcBalanceProvider } from "./rpc-balance.provider";

@Module({
  controllers: [BalanceController],
  providers: [
    BalanceService,
    { provide: BALANCE_PROVIDER, useClass: RpcBalanceProvider },
  ],
})
export class BalanceModule {}
