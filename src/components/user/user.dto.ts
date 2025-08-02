import { IsEmail, IsNotEmpty, IsString, IsNumber, IsIn } from "class-validator";

export class InviteEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  organisationId: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsNumber()
  salary: number; // In USDC
}

export class AddWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["BASE", "SOL", "AVAX", "LINEA", "ETH", "OPTIMISM"])
  chain: string;
}
