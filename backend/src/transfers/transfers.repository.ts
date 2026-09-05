import type { Transfer, TransfersQuery, CreateTransferDto } from "contracts";

export const TRANSFERS_REPOSITORY = Symbol("TRANSFERS_REPOSITORY");

export interface TransfersRepository {
  findAll(query: TransfersQuery): Promise<Transfer[]>;
  create(dto: CreateTransferDto, from: string): Promise<Transfer>;
}
