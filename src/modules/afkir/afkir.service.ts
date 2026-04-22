import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAfkirDto } from './dto/create-afkir.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class AfkirService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history, 'checkInTime');
        return this.prisma.afkirLog.findMany({
            where,
            orderBy: { checkInTime: 'desc' },
        });
    }

    async findOne(id: string) {
        const afkir = await this.prisma.afkirLog.findUnique({ where: { id } });
        if (!afkir) throw new NotFoundException('Afkir log tidak ditemukan');
        return afkir;
    }

    async create(dto: CreateAfkirDto, userId: string) {
        return this.prisma.afkirLog.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                plateNumber: dto.plateNumber,
                driverName: dto.driverName,
                driverId: dto.driverId,
                vehicleType: dto.vehicleType,
                itemType: dto.itemType,
                total: dto.total,
                buyer: dto.buyer,
                approvedBy: dto.approvedBy,
                identityNote: dto.identityNote,
                createdBy: userId,
            },
            update: {
                plateNumber: dto.plateNumber,
                driverName: dto.driverName,
                driverId: dto.driverId,
                vehicleType: dto.vehicleType,
                itemType: dto.itemType,
                total: dto.total,
                buyer: dto.buyer,
                approvedBy: dto.approvedBy,
                identityNote: dto.identityNote,
            },
        });
    }

    async checkout(id: string) {
        const afkir = await this.prisma.afkirLog.findUnique({ where: { id } });
        if (!afkir) throw new NotFoundException('Afkir log tidak ditemukan');
        return this.prisma.afkirLog.update({
            where: { id },
            data: {
                status: 'OUT',
                checkOutTime: new Date(),
            },
        });
    }
}
