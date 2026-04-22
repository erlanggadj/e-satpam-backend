import { Module } from '@nestjs/common';
import { ContainerService } from './container.service.js';
import { ContainerController } from './container.controller.js';

@Module({
    controllers: [ContainerController],
    providers: [ContainerService],
    exports: [ContainerService],
})
export class ContainerModule { }
