import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { IzinService } from './izin.service.js';
import { CreateIzinDto } from './dto/create-izin.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Izin')
@ApiBearerAuth()
@Controller('izin')
export class IzinController {
    constructor(private readonly izinService: IzinService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.izinService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateIzinDto, @CurrentUser() user: { id: string }) {
        return this.izinService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.izinService.findOne(id);
    }

    @Patch(':id/kembali')
    kembali(@Param('id') id: string) {
        return this.izinService.kembali(id);
    }
}
