import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateKeylogDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    keyName: string;

    @IsString()
    @IsNotEmpty()
    depositorName: string;

    @IsString()
    @IsOptional()
    depositorDivision?: string;

    @IsString()
    @IsOptional()
    keterangan?: string;
}
