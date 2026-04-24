import { BadRequestException, Injectable } from '@nestjs/common';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface HistoryItem {
    module: string;
    id: string;
    title: string;
    createdAt: Date;
    status: string | null;
}

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: {
        module?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.module) where.module = query.module;

        const dateFilter = this.buildHistoryDateFilter(query.from, query.to);
        if (Object.keys(dateFilter).length > 0) {
            where.createdAt = dateFilter;
        }

        const [items, total] = await Promise.all([
            (this.prisma as any).activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            (this.prisma as any).activityLog.count({ where }),
        ]);

        return {
            data: items.map((item: any) => ({
                module: item.module,
                id: item.recordId,
                title: item.title,
                createdAt: item.createdAt,
                status: item.status,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    private buildHistoryDateFilter(from?: string, to?: string) {
        if (!from && !to) return {};
        const filter: Record<string, unknown> = {};
        if (from) filter.gte = startOfDay(parseISO(from));
        if (to) filter.lte = endOfDay(parseISO(to));
        return filter;
    }

    async approve(module: string, id: string) {
        // Enums in prisma are automatically typed, using casting for dynamic module dispatch
        // This will trigger prisma middleware automatically.
        switch (module) {
            case 'mutasi': return this.prisma.mutasi.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'kejadian': return this.prisma.laporanKejadian.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'piket': return this.prisma.laporanPiket.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'tamu': return this.prisma.bukuTamu.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'keylog': return this.prisma.keyLog.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'container': return this.prisma.containerLog.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'afkir': return this.prisma.afkirLog.update({ where: { id }, data: { status: 'APPROVED' } });
            case 'izin': return this.prisma.izinStaff.update({ where: { id }, data: { status: 'APPROVED' } });
            default: throw new BadRequestException(`Module ${module} not supported for approval`);
        }
    }
}
