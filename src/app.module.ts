import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { MutasiModule } from './modules/mutasi/mutasi.module.js';
import { KejadianModule } from './modules/kejadian/kejadian.module.js';
import { PiketModule } from './modules/piket/piket.module.js';
import { TamuModule } from './modules/tamu/tamu.module.js';
import { KeylogModule } from './modules/keylog/keylog.module.js';
import { ContainerModule } from './modules/container/container.module.js';
import { AfkirModule } from './modules/afkir/afkir.module.js';
import { IzinModule } from './modules/izin/izin.module.js';
import { HistoryModule } from './modules/history/history.module.js';
import { SyncModule } from './modules/sync/sync.module.js';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate Limiting: 100 req/min per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Database
    PrismaModule,

    // Auth
    AuthModule,

    // Domain Modules
    MutasiModule,
    KejadianModule,
    PiketModule,
    TamuModule,
    KeylogModule,
    ContainerModule,
    AfkirModule,
    IzinModule,

    // Aggregated
    HistoryModule,
    SyncModule,
  ],
  providers: [
    // Global JWT Auth Guard — semua endpoint protected kecuali @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global Rate Limit Guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
