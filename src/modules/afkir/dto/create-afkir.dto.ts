import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateAfkirDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    plateNumber: string;

    @IsString()
    @IsNotEmpty()
    driverName: string;

    @IsString()
    @IsNotEmpty()
    driverId: string;

    @IsString()
    @IsNotEmpty()
    vehicleType: string;

    @IsString()
    @IsNotEmpty()
    itemType: string;

    @IsString()
    @IsNotEmpty()
    total: string;

    @IsString()
    @IsNotEmpty()
    buyer: string;

    @IsString()
    @IsNotEmpty()
    approvedBy: string;

    @IsString()
    @IsOptional()
    identityNote?: string;
}
