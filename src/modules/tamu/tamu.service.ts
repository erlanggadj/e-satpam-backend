import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTamuDto } from './dto/create-tamu.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class TamuService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history);
        return this.prisma.bukuTamu.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tamu = await this.prisma.bukuTamu.findUnique({ where: { id } });
        if (!tamu) throw new NotFoundException('Data tamu tidak ditemukan');
        return tamu;
    }

    async create(dto: CreateTamuDto, userId: string) {
        return this.prisma.bukuTamu.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                namaTamu: dto.namaTamu,
                tujuan: dto.tujuan,
                pukul: dto.pukul,
                keterangan: dto.keterangan,
                noTelp: dto.noTelp,
                createdBy: userId,
            },
            update: {
                namaTamu: dto.namaTamu,
                tujuan: dto.tujuan,
                pukul: dto.pukul,
                keterangan: dto.keterangan,
                noTelp: dto.noTelp,
            },
        });
    }
}
