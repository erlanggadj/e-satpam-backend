import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { KeylogService } from './keylog.service.js';
import { CreateKeylogDto } from './dto/create-keylog.dto.js';
import { AmbilKeylogDto } from './dto/ambil-keylog.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('KeyLog')
@ApiBearerAuth()
@Controller('keylog')
export class KeylogController {
    constructor(private readonly keylogService: KeylogService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.keylogService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateKeylogDto, @CurrentUser() user: { id: string }) {
        return this.keylogService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.keylogService.findOne(id);
    }

    @Patch(':id/ambil')
    ambil(@Param('id') id: string, @Body() dto: AmbilKeylogDto) {
        return this.keylogService.ambil(id, dto);
    }
}
