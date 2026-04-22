import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

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

        const dateFilter = this.buildHistoryDateFilter(query.from, query.to);
        const modules = query.module ? [query.module] : [
            'mutasi', 'kejadian', 'piket', 'tamu', 'keylog', 'container', 'afkir', 'izin',
        ];

        const items: HistoryItem[] = [];

        for (const mod of modules) {
            const modItems = await this.fetchModuleItems(mod, dateFilter);
            items.push(...modItems);
        }

        // Sort by date descending
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = items.length;
        const paged = items.slice(skip, skip + limit);

        return {
            data: paged,
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

    private async fetchModuleItems(
        module: string,
        dateFilter: Record<string, unknown>,
    ): Promise<HistoryItem[]> {
        const hasDateFilter = Object.keys(dateFilter).length > 0;

        switch (module) {
            case 'mutasi': {
                const records = await this.prisma.mutasi.findMany({
                    where: hasDateFilter ? { createdAt: dateFilter } : {},
                    orderBy: { createdAt: 'desc' },
                });
                return records.map((r) => ({
                    module: 'mutasi',
                    id: r.id,
                    title: `${r.posName} - ${r.shiftName}`,
                    createdAt: r.createdAt,
                    status: r.status,
                }));
            }
            case 'kejadian': {
                const records = await this.prisma.laporanKejadian.findMany({
                    where: hasDateFilter ? { createdAt: dateFilter } : {},
                    orderBy: { createdAt: 'desc' },
                });
                return records.map((r) => ({
                    module: 'kejadian',
                    id: r.id,
                    title: r.perihal,
                    createdAt: r.createdAt,
                    status: r.status,
                }));
            }
            case 'piket': {
                const records = await this.prisma.laporanPiket.findMany({
                    where: hasDateFilter ? { createdAt: dateFilter } : {},
                    orderBy: { createdAt: 'desc' },
                });
                return records.map((r) => ({
                    module: 'piket',
                    id: r.id,
                    title: `${r.lokasi} - ${r.petugas}`,
                    createdAt: r.createdAt,
                    status: null,
                }));
            }
            case 'tamu': {
                const records = await this.prisma.bukuTamu.findMany({
                    where: hasDateFilter ? { createdAt: dateFilter } : {},
                    orderBy: { createdAt: 'desc' },
                });
                return records.map((r) => ({
                    module: 'tamu',
                    id: r.id,
                    title: r.namaTamu,
                    createdAt: r.createdAt,
                    status: null,
                }));
            }
            case 'keylog': {
                const records = await this.prisma.keyLog.findMany({
                    where: hasDateFilter ? { depositTime: dateFilter } : {},
                    orderBy: { depositTime: 'desc' },
                });
                return records.map((r) => ({
                    module: 'keylog',
                    id: r.id,
                    title: r.keyName,
                    createdAt: r.depositTime,
                    status: r.status,
                }));
            }
            case 'container': {
                const records = await this.prisma.containerLog.findMany({
                    where: hasDateFilter ? { checkInTime: dateFilter } : {},
                    orderBy: { checkInTime: 'desc' },
                });
                return records.map((r) => ({
                    module: 'container',
                    id: r.id,
                    title: `${r.plateNumber} - ${r.driverName}`,
                    createdAt: r.checkInTime,
                    status: r.status,
                }));
            }
            case 'afkir': {
                const records = await this.prisma.afkirLog.findMany({
                    where: hasDateFilter ? { checkInTime: dateFilter } : {},
                    orderBy: { checkInTime: 'desc' },
                });
                return records.map((r) => ({
                    module: 'afkir',
                    id: r.id,
                    title: `${r.plateNumber} - ${r.itemType}`,
                    createdAt: r.checkInTime,
                    status: r.status,
                }));
            }
            case 'izin': {
                const records = await this.prisma.izinStaff.findMany({
                    where: hasDateFilter ? { timeOut: dateFilter } : {},
                    orderBy: { timeOut: 'desc' },
                });
                return records.map((r) => ({
                    module: 'izin',
                    id: r.id,
                    title: `${r.name} - ${r.destination}`,
                    createdAt: r.timeOut,
                    status: r.status,
                }));
            }
            default:
                return [];
        }
    }
}
