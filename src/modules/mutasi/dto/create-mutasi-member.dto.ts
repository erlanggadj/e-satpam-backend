import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Attendance } from '@prisma/client';

export class CreateMutasiMemberDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    guardName: string;

    @IsString()
    @IsOptional()
    jabatan?: string;

    @IsEnum(Attendance)
    attendance: Attendance;
}
