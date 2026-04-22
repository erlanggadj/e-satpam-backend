import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateContainerDto } from './dto/create-container.dto.js';
import { CheckoutContainerDto } from './dto/checkout-container.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class ContainerService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history, 'checkInTime');
        return this.prisma.containerLog.findMany({
            where,
            orderBy: { checkInTime: 'desc' },
        });
    }

    async findOne(id: string) {
        const container = await this.prisma.containerLog.findUnique({ where: { id } });
        if (!container) throw new NotFoundException('Container log tidak ditemukan');
        return container;
    }

    async create(dto: CreateContainerDto, userId: string) {
        return this.prisma.containerLog.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                plateNumber: dto.plateNumber,
                driverName: dto.driverName,
                driverId: dto.driverId,
                vehicleType: dto.vehicleType,
                cargo: dto.cargo,
                total: dto.total,
                containerIn: dto.containerIn,
                identityNote: dto.identityNote,
                createdBy: userId,
            },
            update: {
                plateNumber: dto.plateNumber,
                driverName: dto.driverName,
                driverId: dto.driverId,
                vehicleType: dto.vehicleType,
                cargo: dto.cargo,
                total: dto.total,
                containerIn: dto.containerIn,
                identityNote: dto.identityNote,
            },
        });
    }

    async checkout(id: string, dto: CheckoutContainerDto) {
        const container = await this.prisma.containerLog.findUnique({ where: { id } });
        if (!container) throw new NotFoundException('Container log tidak ditemukan');
        return this.prisma.containerLog.update({
            where: { id },
            data: {
                status: 'OUT',
                containerOut: dto.containerOut,
                checkOutTime: new Date(),
            },
        });
    }
}
