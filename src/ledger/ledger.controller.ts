import {
  Body,
  Controller,
  Get,
  HttpCode,
  Headers,
  Post,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Item, ITEMS } from '../item/item.data';
import { LedgerService } from './ledger.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AddCreditDto } from './dto/addCredit.dto';
import { BalanceResponseDto } from './dto/balanceResponse.dto';
import { CreatePurchaseDto } from './dto/createPurchase.dto';
import { isValidUuid } from '../util/uuid-validator';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('/items')
  getItems(): Item[] {
    return ITEMS.map(
      (i: Item): Item => ({
        id: i.id,
        name: i.name,
        priceInCents: i.priceInCents,
      }),
    );
  }

  @Post('/credits')
  @ApiOperation({ summary: 'Add credit transaction to user ledger' })
  @ApiOkResponse({ type: BalanceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid x-user-id or amount payload' })
  async addCredits(
    @Headers('x-user-id') xUserId: string,
    @Body() addCreditDto: AddCreditDto,
  ): Promise<BalanceResponseDto> {
    if (!isValidUuid(xUserId)) {
      throw new BadRequestException(
        'Invalid x-user-id header - must be UUIDv4',
      );
    }

    console.log('About to add credit to user account for - userId:', xUserId);
    const balance: number = await this.ledgerService.addCredit(
      xUserId,
      addCreditDto.amount,
    );

    console.log('We added the credit successfully - balance:', balance);
    return new BalanceResponseDto(balance);
  }

  @Post('/purchases')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Create a purchase (debit) transaction' })
  @ApiNoContentResponse({ description: 'Purchase completed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid x-user-id' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  @ApiConflictResponse({ description: 'Insufficient balance' })
  async createPurchase(
    @Headers('x-user-id') xUserId: string,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ): Promise<void> {
    if (!isValidUuid(xUserId)) {
      throw new BadRequestException(
        'Invalid x-user-id header - must be UUIDv4',
      );
    }

    await this.ledgerService.purchase(xUserId, createPurchaseDto.itemId);
  }

  @Get('/balance')
  @ApiOperation({ summary: 'Get current user balance from ledger sums' })
  @ApiOkResponse({ type: BalanceResponseDto })
  async getBalance(
    @Headers('x-user-id') xUserId: string,
  ): Promise<BalanceResponseDto> {
    if (!isValidUuid(xUserId)) {
      throw new BadRequestException(
        'Invalid x-user-id header - must be UUIDv4',
      );
    }

    const balance: number = await this.ledgerService.getBalance(xUserId);
    return new BalanceResponseDto(balance);
  }
}
