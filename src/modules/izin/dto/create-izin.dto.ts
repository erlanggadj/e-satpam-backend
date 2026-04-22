import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ReasonType } from '@prisma/client';

export class CreateIzinDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    department: string;

    @IsEnum(ReasonType)
    reasonType: ReasonType;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsString()
    @IsOptional()
    note?: string;
}
