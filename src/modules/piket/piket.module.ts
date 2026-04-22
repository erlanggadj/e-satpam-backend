import { Module } from '@nestjs/common';
import { PiketService } from './piket.service.js';
import { PiketController } from './piket.controller.js';

@Module({
    controllers: [PiketController],
    providers: [PiketService],
    exports: [PiketService],
})
export class PiketModule { }
