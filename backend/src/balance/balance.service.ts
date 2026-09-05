import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  CHAINS,
  type Balance,
  type BalanceQuery,
  type KnownChainId,
} from "contracts";
import { Address } from "../chain/address.vo";
import { BALANCE_PROVIDER, type BalanceProvider } from "./balance.provider";
import { InvalidAddressError } from "../transfers/transfers.errors";

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @Inject(BALANCE_PROVIDER)
    private readonly provider: BalanceProvider,
  ) {}

  async get(query: BalanceQuery): Promise<Balance> {
    const meta = CHAINS[query.chainId as KnownChainId];
    if (!meta) {
      throw new BadRequestException({
        errors: { chainId: "Unsupported chain" },
      });
    }

    let address: Address;
    try {
      address = Address.from(query.address, query.chainId);
    } catch (error) {
      if (error instanceof InvalidAddressError) {
        throw new BadRequestException({ errors: { address: error.message } });
      }
      throw error;
    }

    try {
      const wei = await this.provider.getBalance(address.value, query.chainId);
      return {
        address: address.value,
        chainId: query.chainId,
        wei,
        decimals: meta.decimals,
        symbol: meta.nativeSymbol,
      };
    } catch (error) {
      this.logger.error(
        `Balance fetch failed for ${address.value}: ${String(error)}`,
      );
      throw new ServiceUnavailableException("Unable to fetch balance");
    }
  }
}
