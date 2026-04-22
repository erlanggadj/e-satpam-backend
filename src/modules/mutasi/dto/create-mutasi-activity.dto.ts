import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMutasiActivityDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    guardName: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
