import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncLog(moduleName: string, recordId: string, title: string, status: string, createdBy: string, createdAt: Date) {
    const existing = await prisma.activityLog.findFirst({
        where: { module: moduleName, recordId }
    });
    if (!existing) {
        await prisma.activityLog.create({
            data: { module: moduleName, recordId, title, status, createdBy, createdAt }
        }).catch(e => console.error(`Error creating log for ${moduleName} ${recordId}:`, e));
    } else {
        await prisma.activityLog.update({
            where: { id: existing.id },
            data: { title, status, createdAt }
        }).catch(e => console.error(`Error updating log for ${moduleName} ${recordId}:`, e));
    }
}

async function main() {
    console.log('🔄 Starting ActivityLog Backfill...');
    let totalMoved = 0;

    // 1. Mutasi
    const mutasi = await prisma.mutasi.findMany({ where: { status: 'SUBMITTED' } });
    for (const m of mutasi) {
        await syncLog('mutasi', m.id, `${m.posName} - ${m.shiftName}`, m.status, m.createdBy, m.createdAt);
    }
    console.log(`✅ Mutasi: ${mutasi.length} records`);
    totalMoved += mutasi.length;

    // 2. Laporan Kejadian
    const kejadian = await prisma.laporanKejadian.findMany();
    for (const k of kejadian) {
        await syncLog('kejadian', k.id, k.perihal, k.status, k.createdBy, k.createdAt);
    }
    console.log(`✅ Laporan Kejadian: ${kejadian.length} records`);
    totalMoved += kejadian.length;

    // 3. Piket
    const piket = await prisma.laporanPiket.findMany();
    for (const p of piket) {
        await syncLog('piket', p.id, `${p.lokasi} - ${p.petugas}`, p.status, p.createdBy, p.createdAt);
    }
    console.log(`✅ Laporan Piket: ${piket.length} records`);
    totalMoved += piket.length;

    // 4. Tamu
    const tamu = await prisma.bukuTamu.findMany();
    for (const t of tamu) {
        await syncLog('tamu', t.id, t.namaTamu, t.status, t.createdBy, t.createdAt);
    }
    console.log(`✅ Buku Tamu: ${tamu.length} records`);
    totalMoved += tamu.length;

    // 5. KeyLog
    const keylog = await prisma.keyLog.findMany({ where: { status: 'TAKEN' } });
    for (const k of keylog) {
        await syncLog('keylog', k.id, k.keyName, k.status, k.createdBy, k.depositTime);
    }
    console.log(`✅ KeyLog: ${keylog.length} records`);
    totalMoved += keylog.length;

    // 6. Container
    const container = await prisma.containerLog.findMany({ where: { status: 'OUT' } });
    for (const c of container) {
        await syncLog('container', c.id, `${c.plateNumber} - ${c.driverName}`, c.status, c.createdBy, c.checkInTime);
    }
    console.log(`✅ Container: ${container.length} records`);
    totalMoved += container.length;

    // 7. Afkir
    const afkir = await prisma.afkirLog.findMany({ where: { status: 'OUT' } });
    for (const a of afkir) {
        await syncLog('afkir', a.id, `${a.plateNumber} - ${a.itemType}`, a.status, a.createdBy, a.checkInTime);
    }
    console.log(`✅ Afkir: ${afkir.length} records`);
    totalMoved += afkir.length;

    // 8. Izin
    const izin = await prisma.izinStaff.findMany({ where: { status: 'RETURNED' } });
    for (const i of izin) {
        await syncLog('izin', i.id, `${i.name} - ${i.destination}`, i.status, i.createdBy, i.timeOut);
    }
    console.log(`✅ Izin Staff: ${izin.length} records`);
    totalMoved += izin.length;

    console.log(`🎉 Backfill complete! Total processed records: ${totalMoved}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
