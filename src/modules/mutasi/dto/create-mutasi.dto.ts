import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateMutasiDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    posName: string;

    @IsString()
    @IsNotEmpty()
    shiftName: string;

    @IsDateString()
    date: string;
}
