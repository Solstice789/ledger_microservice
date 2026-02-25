import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  itemId!: string;
}
