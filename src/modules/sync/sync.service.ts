import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SyncBatchDto } from './dto/sync-batch.dto.js';

@Injectable()
export class SyncService {
    constructor(private prisma: PrismaService) { }

    async syncBatch(dto: SyncBatchDto, userId: string) {
        const synced: string[] = [];
        const failed: { id: string; error: string }[] = [];

        for (const record of dto.records) {
            try {
                const id = record['id'] as string;
                if (!id) {
                    failed.push({ id: 'unknown', error: 'Missing id field' });
                    continue;
                }

                await this.upsertRecord(dto.module, record as Record<string, unknown>, userId);
                synced.push(id);
            } catch (error) {
                const id = (record['id'] as string) || 'unknown';
                const message = error instanceof Error ? error.message : 'Unknown error';
                failed.push({ id, error: message });
            }
        }

        return { synced, failed };
    }

    private async upsertRecord(
        module: string,
        record: Record<string, unknown>,
        userId: string,
    ) {
        const id = record['id'] as string;
        const { id: _id, ...rest } = record;
        const data: Record<string, unknown> = { ...rest, createdBy: userId };

        switch (module) {
            case 'mutasi':
                return this.prisma.mutasi.upsert({
                    where: { id },
                    create: { id, ...data, date: new Date(data['date'] as string) } as any,
                    update: data as any,
                });
            case 'kejadian':
                return this.prisma.laporanKejadian.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'piket':
                return this.prisma.laporanPiket.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'tamu':
                return this.prisma.bukuTamu.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'keylog':
                return this.prisma.keyLog.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'container':
                return this.prisma.containerLog.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'afkir':
                return this.prisma.afkirLog.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            case 'izin':
                return this.prisma.izinStaff.upsert({
                    where: { id },
                    create: { id, ...data } as any,
                    update: data as any,
                });
            default:
                throw new BadRequestException(`Module "${module}" tidak dikenali`);
        }
    }
}
