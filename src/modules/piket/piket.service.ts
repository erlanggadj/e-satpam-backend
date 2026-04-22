import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePiketDto } from './dto/create-piket.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class PiketService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history);
        return this.prisma.laporanPiket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const piket = await this.prisma.laporanPiket.findUnique({ where: { id } });
        if (!piket) throw new NotFoundException('Laporan piket tidak ditemukan');
        return piket;
    }

    async create(dto: CreatePiketDto, userId: string) {
        return this.prisma.laporanPiket.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                lokasi: dto.lokasi,
                petugas: dto.petugas,
                hasil: dto.hasil,
                keterangan: dto.keterangan,
                createdBy: userId,
            },
            update: {
                lokasi: dto.lokasi,
                petugas: dto.petugas,
                hasil: dto.hasil,
                keterangan: dto.keterangan,
            },
        });
    }
}
