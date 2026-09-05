import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  CreateTransferSchema,
  TransfersQuerySchema,
  type CreateTransferDto,
  type Transfer,
  type TransfersQuery,
} from "contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { TransfersService } from "./transfers.service";

@Controller("transfers")
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(TransfersQuerySchema)) query: TransfersQuery,
  ): Promise<Transfer[]> {
    return this.service.list(query);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTransferSchema)) dto: CreateTransferDto,
  ): Promise<Transfer> {
    return this.service.create(dto);
  }
}
