import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PiketService } from './piket.service.js';
import { CreatePiketDto } from './dto/create-piket.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Piket')
@ApiBearerAuth()
@Controller('piket')
export class PiketController {
    constructor(private readonly piketService: PiketService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.piketService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreatePiketDto, @CurrentUser() user: { id: string }) {
        return this.piketService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.piketService.findOne(id);
    }
}
