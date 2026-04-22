import { Module } from '@nestjs/common';
import { MutasiService } from './mutasi.service.js';
import { MutasiController } from './mutasi.controller.js';

@Module({
    controllers: [MutasiController],
    providers: [MutasiService],
    exports: [MutasiService],
})
export class MutasiModule { }
