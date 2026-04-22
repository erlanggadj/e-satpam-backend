import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TamuService } from './tamu.service.js';
import { CreateTamuDto } from './dto/create-tamu.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Tamu')
@ApiBearerAuth()
@Controller('tamu')
export class TamuController {
    constructor(private readonly tamuService: TamuService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.tamuService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateTamuDto, @CurrentUser() user: { id: string }) {
        return this.tamuService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tamuService.findOne(id);
    }
}
