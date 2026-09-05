import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { Transfer, TransfersQuery, CreateTransferDto } from "contracts";
import { Address } from "../chain/address.vo";
import {
  TRANSFERS_REPOSITORY,
  type TransfersRepository,
} from "./transfers.repository";
import { InvalidAddressError } from "./transfers.errors";

const CURRENT_ACCOUNT = "0x1111111111111111111111111111111111111111";

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    @Inject(TRANSFERS_REPOSITORY)
    private readonly repository: TransfersRepository,
  ) {}

  list(query: TransfersQuery): Promise<Transfer[]> {
    return this.repository.findAll(query);
  }

  async create(dto: CreateTransferDto): Promise<Transfer> {
    let to: Address;
    try {
      to = Address.from(dto.to, dto.chainId);
    } catch (error) {
      if (error instanceof InvalidAddressError) {
        throw new BadRequestException({ errors: { to: error.message } });
      }
      throw error;
    }

    const from = Address.from(CURRENT_ACCOUNT, dto.chainId);

    if (to.equals(from)) {
      throw new BadRequestException({
        errors: { to: "Cannot send to your own address" },
      });
    }

    try {
      return await this.repository.create({ ...dto, to: to.value }, from.value);
    } catch (error) {
      this.logger.error(`Transfer creation failed: ${String(error)}`);
      throw new ServiceUnavailableException(
        "Transfer failed, please try again",
      );
    }
  }
}
