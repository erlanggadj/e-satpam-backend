import { Module } from '@nestjs/common';
import { IzinService } from './izin.service.js';
import { IzinController } from './izin.controller.js';

@Module({
    controllers: [IzinController],
    providers: [IzinService],
    exports: [IzinService],
})
export class IzinModule { }
