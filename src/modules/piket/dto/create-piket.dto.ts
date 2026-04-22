import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePiketDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    lokasi: string;

    @IsString()
    @IsNotEmpty()
    petugas: string;

    @IsString()
    @IsNotEmpty()
    hasil: string;

    @IsString()
    @IsOptional()
    keterangan?: string;
}
