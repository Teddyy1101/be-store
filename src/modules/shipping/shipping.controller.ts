import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import {
  CreateShippingDto,
  UpdateShippingDto,
} from '../../model/dto/shipping.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  async createShipping(@Body() dto: CreateShippingDto) {
    return this.shippingService.create(dto);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateShippingDto) {
    return this.shippingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.shippingService.remove(id);
  }
}
