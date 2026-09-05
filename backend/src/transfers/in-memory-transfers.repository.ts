import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  CHAIN_IDS,
  CHAINS,
  type Transfer,
  type TransferStatus,
  type TransfersQuery,
  type CreateTransferDto,
  KnownChainId,
} from "contracts";
import type { TransfersRepository } from "./transfers.repository";

const STATUSES: TransferStatus[] = ["pending", "confirmed", "failed"];
const HEX = "0123456789abcdef";

function randomEvmAddress(): string {
  let out = "0x";
  for (let i = 0; i < 40; i++) {
    out += HEX[Math.floor(Math.random() * 16)];
  }
  return out;
}

function randomAmount(): string {
  const whole = Math.floor(Math.random() * 5000);
  const frac = Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, "0");
  return `${whole}.${frac}`;
}

@Injectable()
export class InMemoryTransfersRepository implements TransfersRepository {
  private readonly items: Transfer[] = [];

  constructor() {
    const now = Date.now();
    for (let i = 0; i < 500; i++) {
      const chainId = CHAIN_IDS[i % CHAIN_IDS.length]!;
      this.items.push({
        id: randomUUID(),
        chainId,
        from: randomEvmAddress(),
        to: randomEvmAddress(),
        amount: randomAmount(),
        decimals: CHAINS[chainId].decimals,
        status: STATUSES[i % STATUSES.length]!,
        createdAt: new Date(now - i * 60_000).toISOString(),
      });
    }
  }

  async findAll(query: TransfersQuery): Promise<Transfer[]> {
    const search = query.search?.toLowerCase();

    return this.items.filter((tx) => {
      if (query.status && tx.status !== query.status) return false;
      if (query.chainId && tx.chainId !== query.chainId) return false;
      if (search) {
        return (
          tx.to.toLowerCase().includes(search) ||
          tx.from.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }

  async create(dto: CreateTransferDto, from: string): Promise<Transfer> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (Math.random() < 0.2) {
      throw new Error("Upstream node unavailable");
    }

    const tx: Transfer = {
      id: randomUUID(),
      chainId: dto.chainId,
      from,
      to: dto.to,
      amount: dto.amount,
      decimals: CHAINS[dto.chainId as KnownChainId]?.decimals ?? 18,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.items.unshift(tx);
    return tx;
  }
}
