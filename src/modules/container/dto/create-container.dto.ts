import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateContainerDto {
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
    cargo: string;

    @IsString()
    @IsNotEmpty()
    total: string;

    @IsString()
    @IsNotEmpty()
    containerIn: string;

    @IsString()
    @IsOptional()
    identityNote?: string;
}
