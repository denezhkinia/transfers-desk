export const BALANCE_PROVIDER = Symbol("BALANCE_PROVIDER");

export interface BalanceProvider {
  getBalance(address: string, chainId: string): Promise<string>;
}
