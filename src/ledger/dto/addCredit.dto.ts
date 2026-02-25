import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCreditDto {
  @ApiProperty({ example: 1000, minimum: 1 })
  @IsInt()
  @IsPositive()
  amount: number;
}
