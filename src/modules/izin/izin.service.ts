import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateIzinDto } from './dto/create-izin.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class IzinService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history, 'timeOut');
        return this.prisma.izinStaff.findMany({
            where,
            orderBy: { timeOut: 'desc' },
        });
    }

    async findOne(id: string) {
        const izin = await this.prisma.izinStaff.findUnique({ where: { id } });
        if (!izin) throw new NotFoundException('Izin tidak ditemukan');
        return izin;
    }

    async create(dto: CreateIzinDto, userId: string) {
        return this.prisma.izinStaff.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                name: dto.name,
                department: dto.department,
                reasonType: dto.reasonType,
                destination: dto.destination,
                note: dto.note,
                createdBy: userId,
            },
            update: {
                name: dto.name,
                department: dto.department,
                reasonType: dto.reasonType,
                destination: dto.destination,
                note: dto.note,
            },
        });
    }

    async kembali(id: string) {
        const izin = await this.prisma.izinStaff.findUnique({ where: { id } });
        if (!izin) throw new NotFoundException('Izin tidak ditemukan');
        return this.prisma.izinStaff.update({
            where: { id },
            data: {
                status: 'RETURNED',
                timeIn: new Date(),
            },
        });
    }
}
