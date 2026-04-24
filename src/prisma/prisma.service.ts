import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      const result = await next(params);

      // Map models to their respective module and title formatting logic
      const modules: Record<string, { moduleName: string; titleFn: (data: any) => string }> = {
        Mutasi: { moduleName: 'mutasi', titleFn: (d) => `${d.posName} - ${d.shiftName}` },
        LaporanKejadian: { moduleName: 'kejadian', titleFn: (d) => d.perihal },
        LaporanPiket: { moduleName: 'piket', titleFn: (d) => `${d.lokasi} - ${d.petugas}` },
        BukuTamu: { moduleName: 'tamu', titleFn: (d) => d.namaTamu },
        KeyLog: { moduleName: 'keylog', titleFn: (d) => d.keyName },
        ContainerLog: { moduleName: 'container', titleFn: (d) => `${d.plateNumber} - ${d.driverName}` },
        AfkirLog: { moduleName: 'afkir', titleFn: (d) => `${d.plateNumber} - ${d.itemType}` },
        IzinStaff: { moduleName: 'izin', titleFn: (d) => `${d.name} - ${d.destination}` },
      };

      if (modules[params.model as string] && ['create', 'update', 'upsert'].includes(params.action) && result) {

        // Cek target status
        const isFinished = () => {
          if (result.status === 'APPROVED') return true;
          switch (params.model as string) {
            case 'Mutasi': return result.status === 'SUBMITTED';
            case 'ContainerLog': return result.status === 'OUT';
            case 'AfkirLog': return result.status === 'OUT';
            case 'KeyLog': return result.status === 'TAKEN';
            case 'IzinStaff': return result.status === 'RETURNED';
            default: return true; // Kejadian, Piket, Tamu 
          }
        };

        if (!isFinished()) {
          return result; // Skip synchronization completely because item is functionally active/process state
        }

        const config = modules[params.model as string];
        try {
          const timestamp = result.createdAt || result.depositTime || result.checkInTime || result.timeOut || new Date();
          const title = config.titleFn(result);

          const existingLog = await (this as any).activityLog.findFirst({ where: { recordId: result.id } });

          if (existingLog) {
            await (this as any).activityLog.update({
              where: { id: existingLog.id },
              data: { title, status: result.status, createdAt: timestamp }
            });
          } else {
            await (this as any).activityLog.create({
              data: {
                module: config.moduleName,
                recordId: result.id,
                title,
                status: result.status,
                createdBy: result.createdBy || 'System',
                createdAt: timestamp
              }
            });
          }
        } catch (error) {
          console.error(`[ActivityLogMiddleware] Failed to sync ${params.model}:`, error);
        }
      }

      return result;
    });
  }
}
