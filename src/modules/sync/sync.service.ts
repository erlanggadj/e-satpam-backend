import { BadRequestException, Injectable } from '@nestjs/common';
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
            case 'mutasi': {
                const { members, activities, ...mutasiData } = data as any;
                return this.prisma.mutasi.upsert({
                    where: { id },
                    create: {
                        id,
                        posName: mutasiData.posName,
                        shiftName: mutasiData.shiftName,
                        date: new Date(mutasiData.date),
                        createdBy: mutasiData.createdBy,
                        status: mutasiData.status,
                        members: members && members.length > 0 ? {
                            create: members.map((m: any) => ({
                                id: m.id,
                                guardName: m.guardName,
                                attendance: m.attendance
                            }))
                        } : undefined,
                        activities: activities && activities.length > 0 ? {
                            create: activities.map((a: any) => ({
                                id: a.id,
                                time: a.time,
                                description: a.description,
                                guardName: a.guardName,
                                isSynced: true
                            }))
                        } : undefined
                    },
                    update: {
                        posName: mutasiData.posName,
                        shiftName: mutasiData.shiftName,
                        date: new Date(mutasiData.date),
                        status: mutasiData.status,
                    },
                });
            }
            case 'kejadian': {
                // Mobile stores data with snake_case; Prisma model expects camelCase
                const {
                    sync_status: _ks, // strip mobile-only field
                    korban_nama, korban_alamat, pelaku_nama, pelaku_alamat,
                    saksi_1, saksi_2, saksi_3, saksi_4,
                    bukti_1, bukti_2, bukti_3, bukti_4,
                    ...kejadianRest
                } = data as any;

                const kejadianData = {
                    ...kejadianRest,
                    createdBy: userId,
                    korbanNama: korban_nama ?? kejadianRest.korbanNama,
                    korbanAlamat: korban_alamat ?? kejadianRest.korbanAlamat,
                    pelakuNama: pelaku_nama ?? kejadianRest.pelakuNama,
                    pelakuAlamat: pelaku_alamat ?? kejadianRest.pelakuAlamat,
                    saksi1: saksi_1 ?? kejadianRest.saksi1,
                    saksi2: saksi_2 ?? kejadianRest.saksi2,
                    saksi3: saksi_3 ?? kejadianRest.saksi3,
                    saksi4: saksi_4 ?? kejadianRest.saksi4,
                    bukti1: bukti_1 ?? kejadianRest.bukti1,
                    bukti2: bukti_2 ?? kejadianRest.bukti2,
                    bukti3: bukti_3 ?? kejadianRest.bukti3,
                    bukti4: bukti_4 ?? kejadianRest.bukti4,
                };

                return this.prisma.laporanKejadian.upsert({
                    where: { id },
                    create: { id, ...kejadianData } as any,
                    update: kejadianData as any,
                });
            }

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
