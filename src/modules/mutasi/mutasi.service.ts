import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMutasiDto } from './dto/create-mutasi.dto.js';
import { CreateMutasiMemberDto } from './dto/create-mutasi-member.dto.js';
import { CreateMutasiActivityDto } from './dto/create-mutasi-activity.dto.js';
import { buildDateFilter } from '../../common/helpers/date.helper.js';

@Injectable()
export class MutasiService {
    constructor(private prisma: PrismaService) { }

    async findAll(history: boolean) {
        const where = buildDateFilter(history);
        return this.prisma.mutasi.findMany({
            where,
            include: { members: true, activities: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const mutasi = await this.prisma.mutasi.findUnique({
            where: { id },
            include: { members: true, activities: true },
        });
        if (!mutasi) throw new NotFoundException('Mutasi tidak ditemukan');
        return mutasi;
    }

    async create(dto: CreateMutasiDto, userId: string) {
        return this.prisma.mutasi.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                posName: dto.posName,
                shiftName: dto.shiftName,
                date: new Date(dto.date),
                createdBy: userId,
            },
            update: {
                posName: dto.posName,
                shiftName: dto.shiftName,
                date: new Date(dto.date),
            },
        });
    }

    async submit(id: string) {
        const mutasi = await this.prisma.mutasi.findUnique({ where: { id } });
        if (!mutasi) throw new NotFoundException('Mutasi tidak ditemukan');
        return this.prisma.mutasi.update({
            where: { id },
            data: { status: 'SUBMITTED' },
        });
    }

    async addMember(mutasiId: string, dto: CreateMutasiMemberDto) {
        const mutasi = await this.prisma.mutasi.findUnique({ where: { id: mutasiId } });
        if (!mutasi) throw new NotFoundException('Mutasi tidak ditemukan');
        return this.prisma.mutasiMember.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                mutasiId,
                guardName: dto.guardName,
                jabatan: dto.jabatan,
                attendance: dto.attendance,
            },
            update: {
                guardName: dto.guardName,
                jabatan: dto.jabatan,
                attendance: dto.attendance,
            },
        });
    }

    async addActivity(mutasiId: string, dto: CreateMutasiActivityDto) {
        const mutasi = await this.prisma.mutasi.findUnique({ where: { id: mutasiId } });
        if (!mutasi) throw new NotFoundException('Mutasi tidak ditemukan');
        return this.prisma.mutasiActivity.upsert({
            where: { id: dto.id || '' },
            create: {
                ...(dto.id ? { id: dto.id } : {}),
                mutasiId,
                guardName: dto.guardName,
                time: dto.time,
                description: dto.description,
            },
            update: {
                guardName: dto.guardName,
                time: dto.time,
                description: dto.description,
            },
        });
    }
}
