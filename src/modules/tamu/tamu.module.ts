import { Module } from '@nestjs/common';
import { TamuService } from './tamu.service.js';
import { TamuController } from './tamu.controller.js';

@Module({
    controllers: [TamuController],
    providers: [TamuService],
    exports: [TamuService],
})
export class TamuModule { }
