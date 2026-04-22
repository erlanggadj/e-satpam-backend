import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ContainerService } from './container.service.js';
import { CreateContainerDto } from './dto/create-container.dto.js';
import { CheckoutContainerDto } from './dto/checkout-container.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Container')
@ApiBearerAuth()
@Controller('container')
export class ContainerController {
    constructor(private readonly containerService: ContainerService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.containerService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateContainerDto, @CurrentUser() user: { id: string }) {
        return this.containerService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.containerService.findOne(id);
    }

    @Patch(':id/checkout')
    checkout(@Param('id') id: string, @Body() dto: CheckoutContainerDto) {
        return this.containerService.checkout(id, dto);
    }
}
