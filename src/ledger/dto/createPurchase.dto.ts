import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'fef3b13c-a0b2-4ba6-b13d-de56f5593144',
  })
  @IsUUID()
  itemId!: string;
}
