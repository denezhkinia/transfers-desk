import { Module } from "@nestjs/common";
import { TransfersModule } from "../transfers/transfers.module";
import { BalanceModule } from "../balance/balance.module";

@Module({
  imports: [TransfersModule, BalanceModule],
})
export class AppModule {}
