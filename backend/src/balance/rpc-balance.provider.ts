import { Injectable, Logger } from "@nestjs/common";
import type { KnownChainId } from "contracts";
import type { BalanceProvider } from "./balance.provider";

const RPC_URLS: Record<KnownChainId, string> = {
  "eip155:1": "https://eth.llamarpc.com",
  "eip155:59144": "https://rpc.linea.build",
  "eip155:8453": "https://mainnet.base.org",
};

const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class RpcBalanceProvider implements BalanceProvider {
  private readonly logger = new Logger(RpcBalanceProvider.name);
  private readonly cache = new Map<string, { wei: string; at: number }>();

  async getBalance(address: string, chainId: string): Promise<string> {
    const url = RPC_URLS[chainId as KnownChainId];
    if (!url) {
      throw new Error(`No RPC endpoint for ${chainId}`);
    }

    const key = `${chainId}:${address}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.wei;
    }

    const wei = await this.fetchBalance(url, address);
    this.cache.set(key, { wei, at: Date.now() });
    return wei;
  }

  private async fetchBalance(url: string, address: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    let json: { result?: string; error?: { message: string } };

    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
        signal: controller.signal,
      });
      json = await res.json();
    } catch (error) {
      this.logger.warn(`Balance fetch failed: ${String(error)}`);
      throw error;
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) throw new Error(`RPC responded ${res.status}`);
    if (json.error) throw new Error(json.error.message);
    if (!json.result) throw new Error("RPC returned no result");

    return BigInt(json.result).toString();
  }
}
