import { z } from "zod";

export const CaipChainId = z
  .string()
  .regex(/^[-a-z0-9]{3,8}:[-_a-zA-Z0-9]{1,32}$/, "Invalid CAIP-2 chain id");

export const Namespace = z.enum(["eip155"]);
export type Namespace = z.infer<typeof Namespace>;

export interface NamespaceSpec {
  address: z.ZodType<string>;
  normalize: (raw: string) => string;
}

export const NAMESPACES: Record<Namespace, NamespaceSpec> = {
  eip155: {
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address"),
    normalize: (raw) => raw.toLowerCase(),
  },
};

export const namespaceOf = (chainId: string): Namespace | null => {
  const parsed = Namespace.safeParse(chainId.split(":")[0]);
  return parsed.success ? parsed.data : null;
};

export const addressSchemaFor = (chainId: string): z.ZodType<string> => {
  const ns = namespaceOf(chainId);
  return ns ? NAMESPACES[ns].address : z.string();
};

export interface ChainMeta {
  namespace: Namespace;
  name: string;
  nativeSymbol: string;
  decimals: number;
}

export const CHAINS = {
  "eip155:1": {
    namespace: "eip155",
    name: "Ethereum",
    nativeSymbol: "ETH",
    decimals: 18,
  },
  "eip155:59144": {
    namespace: "eip155",
    name: "Linea",
    nativeSymbol: "ETH",
    decimals: 18,
  },
  "eip155:8453": {
    namespace: "eip155",
    name: "Base",
    nativeSymbol: "ETH",
    decimals: 18,
  },
} as const satisfies Record<string, ChainMeta>;

export type KnownChainId = keyof typeof CHAINS;
export const CHAIN_IDS = Object.keys(CHAINS) as KnownChainId[];

export const TransferStatus = z.enum(["pending", "confirmed", "failed"]);
export type TransferStatus = z.infer<typeof TransferStatus>;

export const TransferSchema = z.object({
  id: z.string(),
  chainId: CaipChainId,
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  decimals: z.number().int().nonnegative(),
  status: TransferStatus,
  createdAt: z.string().datetime(),
});
export type Transfer = z.infer<typeof TransferSchema>;

export const CreateTransferSchema = z
  .object({
    chainId: CaipChainId.default("eip155:1"),
    to: z.string().min(1, "Address is required"),
    amount: z
      .string()
      .refine((v) => /^\d+(\.\d{1,18})?$/.test(v), "Invalid amount format")
      .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  })
  .superRefine((val, ctx) => {
    const result = addressSchemaFor(val.chainId).safeParse(val.to);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: result.error.issues[0]?.message ?? "Invalid address",
      });
    }
  });
export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;

export const TransfersQuerySchema = z.object({
  search: z.string().optional(),
  status: TransferStatus.optional(),
  chainId: CaipChainId.optional(),
});
export type TransfersQuery = z.infer<typeof TransfersQuerySchema>;

export const BalanceQuerySchema = z.object({
  address: z.string().min(1, "Address is required"),
  chainId: CaipChainId.default("eip155:1"),
});
export type BalanceQuery = z.infer<typeof BalanceQuerySchema>;

export const BalanceSchema = z.object({
  address: z.string(),
  chainId: CaipChainId,
  wei: z.string(),
  decimals: z.number().int().nonnegative(),
  symbol: z.string(),
});
export type Balance = z.infer<typeof BalanceSchema>;
