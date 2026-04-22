import { Module } from '@nestjs/common';
import { KejadianService } from './kejadian.service.js';
import { KejadianController } from './kejadian.controller.js';

@Module({
    controllers: [KejadianController],
    providers: [KejadianService],
    exports: [KejadianService],
})
export class KejadianModule { }
