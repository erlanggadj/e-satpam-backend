import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service.js';

@ApiTags('History')
@ApiBearerAuth()
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get()
    @ApiQuery({ name: 'module', required: false })
    @ApiQuery({ name: 'from', required: false })
    @ApiQuery({ name: 'to', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('module') module?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.historyService.findAll({
            module,
            from,
            to,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
}
