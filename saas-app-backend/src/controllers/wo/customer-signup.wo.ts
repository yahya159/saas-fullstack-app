import { AutoMap } from '@automapper/classes';
import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CustomerSignUpWO {
  @IsNotEmpty()
  @IsString()
  @AutoMap()
  username: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @AutoMap()
  email: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  streetAddress: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  streetAddressTwo: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  city: string;

  @IsNotEmpty()
  @IsString()
  @AutoMap()
  state: string;

  @IsNotEmpty()
  @IsNumber()
  @AutoMap()
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @AutoMap()
  password: string;
}
