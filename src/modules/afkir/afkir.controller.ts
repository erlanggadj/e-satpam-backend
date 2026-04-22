import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AfkirService } from './afkir.service.js';
import { CreateAfkirDto } from './dto/create-afkir.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Afkir')
@ApiBearerAuth()
@Controller('afkir')
export class AfkirController {
    constructor(private readonly afkirService: AfkirService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.afkirService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateAfkirDto, @CurrentUser() user: { id: string }) {
        return this.afkirService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.afkirService.findOne(id);
    }

    @Patch(':id/checkout')
    checkout(@Param('id') id: string) {
        return this.afkirService.checkout(id);
    }
}
