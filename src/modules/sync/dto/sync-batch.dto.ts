import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SyncBatchDto {
    @IsString()
    @IsNotEmpty()
    module: string;

    @IsArray()
    @IsNotEmpty()
    records: any[];
}
