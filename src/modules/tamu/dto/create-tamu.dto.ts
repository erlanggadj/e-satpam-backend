import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTamuDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    namaTamu: string;

    @IsString()
    @IsOptional()
    tujuan?: string;

    @IsString()
    @IsNotEmpty()
    pukul: string;

    @IsString()
    @IsOptional()
    keterangan?: string;

    @IsString()
    @IsOptional()
    noTelp?: string;
}
