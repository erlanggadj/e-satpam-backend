import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckoutContainerDto {
    @IsString()
    @IsNotEmpty()
    containerOut: string;
}
