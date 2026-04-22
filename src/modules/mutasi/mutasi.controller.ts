import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MutasiService } from './mutasi.service.js';
import { CreateMutasiDto } from './dto/create-mutasi.dto.js';
import { CreateMutasiMemberDto } from './dto/create-mutasi-member.dto.js';
import { CreateMutasiActivityDto } from './dto/create-mutasi-activity.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Mutasi')
@ApiBearerAuth()
@Controller('mutasi')
export class MutasiController {
    constructor(private readonly mutasiService: MutasiService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.mutasiService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateMutasiDto, @CurrentUser() user: { id: string }) {
        return this.mutasiService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mutasiService.findOne(id);
    }

    @Patch(':id/submit')
    submit(@Param('id') id: string) {
        return this.mutasiService.submit(id);
    }

    @Post(':id/members')
    addMember(@Param('id') id: string, @Body() dto: CreateMutasiMemberDto) {
        return this.mutasiService.addMember(id, dto);
    }

    @Post(':id/activities')
    addActivity(@Param('id') id: string, @Body() dto: CreateMutasiActivityDto) {
        return this.mutasiService.addActivity(id, dto);
    }
}
