import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { KejadianService } from './kejadian.service.js';
import { CreateKejadianDto } from './dto/create-kejadian.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@ApiTags('Kejadian')
@ApiBearerAuth()
@Controller('kejadian')
export class KejadianController {
    constructor(private readonly kejadianService: KejadianService) { }

    @Get()
    @ApiQuery({ name: 'history', required: false, type: Boolean })
    findAll(@Query('history') history?: string) {
        return this.kejadianService.findAll(history === 'true');
    }

    @Post()
    create(@Body() dto: CreateKejadianDto, @CurrentUser() user: { id: string }) {
        return this.kejadianService.create(dto, user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.kejadianService.findOne(id);
    }

    @Patch(':id/review')
    @UseGuards(RolesGuard)
    @Roles(Role.SUPERVISOR)
    review(@Param('id') id: string) {
        return this.kejadianService.review(id);
    }
}
