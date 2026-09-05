import { addressSchemaFor, namespaceOf, NAMESPACES } from "contracts";
import { InvalidAddressError } from "../transfers/transfers.errors";

export class Address {
  private constructor(
    public readonly value: string,
    public readonly chainId: string,
  ) {}

  static from(raw: string, chainId: string): Address {
    const parsed = addressSchemaFor(chainId).safeParse(raw);
    if (!parsed.success) {
      throw new InvalidAddressError(
        parsed.error.issues[0]?.message ?? "Invalid address",
      );
    }

    const ns = namespaceOf(chainId);
    const normalized = ns ? NAMESPACES[ns].normalize(parsed.data) : parsed.data;

    return new Address(normalized, chainId);
  }

  equals(other: Address): boolean {
    return this.value === other.value && this.chainId === other.chainId;
  }
}
