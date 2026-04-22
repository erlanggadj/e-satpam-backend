import { Module } from '@nestjs/common';
import { AfkirService } from './afkir.service.js';
import { AfkirController } from './afkir.controller.js';

@Module({
    controllers: [AfkirController],
    providers: [AfkirService],
    exports: [AfkirService],
})
export class AfkirModule { }
