import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import type { ZodType } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "_";
        errors[field] ??= issue.message;
      }
      throw new BadRequestException({ errors });
    }

    return result.data;
  }
}
