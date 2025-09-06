import { AutoMap } from '@automapper/classes';

export class CustomerSignUpDTO {
  @AutoMap()
  username: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  email: string;

  @AutoMap()
  phoneNumber: string;

  @AutoMap()
  streetAddress: string;

  @AutoMap()
  streetAddressTwo: string;

  @AutoMap()
  city: string;

  @AutoMap()
  state: string;

  @AutoMap()
  zipCode: string;

  @AutoMap()
  password: string;

  @AutoMap()
  parentGroup: string;
}
