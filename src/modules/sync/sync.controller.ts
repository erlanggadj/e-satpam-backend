import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SyncService } from './sync.service.js';
import { SyncBatchDto } from './dto/sync-batch.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    @Post('batch')
    syncBatch(@Body() dto: SyncBatchDto, @CurrentUser() user: { id: string }) {
        return this.syncService.syncBatch(dto, user.id);
    }
}
