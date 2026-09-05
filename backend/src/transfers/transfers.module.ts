import { Module } from "@nestjs/common";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";
import { TRANSFERS_REPOSITORY } from "./transfers.repository";
import { InMemoryTransfersRepository } from "./in-memory-transfers.repository";
import { RpcBalanceProvider } from "../balance/rpc-balance.provider";
import { BALANCE_PROVIDER } from "../balance/balance.provider";

@Module({
  controllers: [TransfersController],
  providers: [
    TransfersService,
    { provide: TRANSFERS_REPOSITORY, useClass: InMemoryTransfersRepository },
    { provide: BALANCE_PROVIDER, useClass: RpcBalanceProvider },
  ],
})
export class TransfersModule {}
