import { Controller, Get, Query } from "@nestjs/common";
import { BalanceQuerySchema, type Balance, type BalanceQuery } from "contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { BalanceService } from "./balance.service";

@Controller("balance")
export class BalanceController {
  constructor(private readonly service: BalanceService) {}

  @Get()
  get(
    @Query(new ZodValidationPipe(BalanceQuerySchema)) query: BalanceQuery,
  ): Promise<Balance> {
    return this.service.get(query);
  }
}
