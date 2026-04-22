import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AmbilKeylogDto {
    @IsString()
    @IsNotEmpty()
    takerName: string;

    @IsString()
    @IsOptional()
    takerDivision?: string;
}
