import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateKejadianDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    nomor: string;

    @IsString()
    @IsNotEmpty()
    perihal: string;

    @IsString()
    @IsNotEmpty()
    tempat: string;

    @IsString()
    @IsNotEmpty()
    tanggal: string;

    @IsString()
    @IsNotEmpty()
    pukul: string;

    @IsString()
    @IsOptional()
    korbanNama?: string;

    @IsString()
    @IsOptional()
    korbanAlamat?: string;

    @IsString()
    @IsOptional()
    pelakuNama?: string;

    @IsString()
    @IsOptional()
    pelakuAlamat?: string;

    @IsString()
    @IsOptional()
    saksi1?: string;

    @IsString()
    @IsOptional()
    saksi2?: string;

    @IsString()
    @IsOptional()
    saksi3?: string;

    @IsString()
    @IsOptional()
    saksi4?: string;

    @IsString()
    @IsOptional()
    bukti1?: string;

    @IsString()
    @IsOptional()
    bukti2?: string;

    @IsString()
    @IsOptional()
    bukti3?: string;

    @IsString()
    @IsOptional()
    bukti4?: string;

    @IsString()
    @IsOptional()
    kronologis?: string;

    @IsString()
    @IsOptional()
    kerugian?: string;

    @IsString()
    @IsOptional()
    tindakan?: string;
}
