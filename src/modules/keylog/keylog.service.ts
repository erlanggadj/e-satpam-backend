import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateKeylogDto } from './dto/create-keylog.dto.js';
import { AmbilKeylogDto } from './dto/ambil-keylog.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class KeylogService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history, 'depositTime');
        return this.prisma.keyLog.findMany({
            where,
            orderBy: { depositTime: 'desc' },
        });
    }

    async findOne(id: string) {
        const keylog = await this.prisma.keyLog.findUnique({ where: { id } });
        if (!keylog) throw new NotFoundException('Key log tidak ditemukan');
        return keylog;
    }

    async create(dto: CreateKeylogDto, userId: string) {
        return this.prisma.keyLog.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                keyName: dto.keyName,
                depositorName: dto.depositorName,
                depositorDivision: dto.depositorDivision,
                keterangan: dto.keterangan,
                createdBy: userId,
            },
            update: {
                keyName: dto.keyName,
                depositorName: dto.depositorName,
                depositorDivision: dto.depositorDivision,
                keterangan: dto.keterangan,
            },
        });
    }

    async ambil(id: string, dto: AmbilKeylogDto) {
        const keylog = await this.prisma.keyLog.findUnique({ where: { id } });
        if (!keylog) throw new NotFoundException('Key log tidak ditemukan');
        return this.prisma.keyLog.update({
            where: { id },
            data: {
                status: 'TAKEN',
                takerName: dto.takerName,
                takerDivision: dto.takerDivision,
                takeTime: new Date(),
            },
        });
    }
}
