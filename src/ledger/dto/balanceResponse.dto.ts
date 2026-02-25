import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  constructor(balance: number) {
    this.balance = balance;
  }

  @ApiProperty({ example: 1000 })
  balance: number;
}
