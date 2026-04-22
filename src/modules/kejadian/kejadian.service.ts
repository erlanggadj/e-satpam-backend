import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateKejadianDto } from './dto/create-kejadian.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class KejadianService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history);
        return this.prisma.laporanKejadian.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const kejadian = await this.prisma.laporanKejadian.findUnique({ where: { id } });
        if (!kejadian) throw new NotFoundException('Laporan kejadian tidak ditemukan');
        return kejadian;
    }

    async create(dto: CreateKejadianDto, userId: string) {
        return this.prisma.laporanKejadian.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                nomor: dto.nomor,
                perihal: dto.perihal,
                tempat: dto.tempat,
                tanggal: dto.tanggal,
                pukul: dto.pukul,
                korbanNama: dto.korbanNama,
                korbanAlamat: dto.korbanAlamat,
                pelakuNama: dto.pelakuNama,
                pelakuAlamat: dto.pelakuAlamat,
                saksi1: dto.saksi1,
                saksi2: dto.saksi2,
                saksi3: dto.saksi3,
                saksi4: dto.saksi4,
                bukti1: dto.bukti1,
                bukti2: dto.bukti2,
                bukti3: dto.bukti3,
                bukti4: dto.bukti4,
                kronologis: dto.kronologis,
                kerugian: dto.kerugian,
                tindakan: dto.tindakan,
                createdBy: userId,
            },
            update: {
                perihal: dto.perihal,
                tempat: dto.tempat,
                tanggal: dto.tanggal,
                pukul: dto.pukul,
                korbanNama: dto.korbanNama,
                korbanAlamat: dto.korbanAlamat,
                pelakuNama: dto.pelakuNama,
                pelakuAlamat: dto.pelakuAlamat,
                saksi1: dto.saksi1,
                saksi2: dto.saksi2,
                saksi3: dto.saksi3,
                saksi4: dto.saksi4,
                bukti1: dto.bukti1,
                bukti2: dto.bukti2,
                bukti3: dto.bukti3,
                bukti4: dto.bukti4,
                kronologis: dto.kronologis,
                kerugian: dto.kerugian,
                tindakan: dto.tindakan,
            },
        });
    }

    async review(id: string) {
        const kejadian = await this.prisma.laporanKejadian.findUnique({ where: { id } });
        if (!kejadian) throw new NotFoundException('Laporan kejadian tidak ditemukan');
        return this.prisma.laporanKejadian.update({
            where: { id },
            data: { status: 'REVIEWED' },
        });
    }
}
