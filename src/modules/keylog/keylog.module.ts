import { Module } from '@nestjs/common';
import { KeylogService } from './keylog.service.js';
import { KeylogController } from './keylog.controller.js';

@Module({
    controllers: [KeylogController],
    providers: [KeylogService],
    exports: [KeylogService],
})
export class KeylogModule { }
