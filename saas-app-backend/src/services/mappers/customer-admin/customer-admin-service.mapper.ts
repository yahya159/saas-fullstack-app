import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserPOJO } from '@Data/models/user/user.pojo.model';
import { UserDTO } from '@Services/dto/user/user.dto';

import { SaasCustomerAdminPOJO } from '@Data/models/saasCustomerAdmin/saasCustomerAdmin.pojo.model';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';

@Injectable()
export class CustomerAdminServiceMapper {
  constructor(@InjectMapper() private readonly classMapper: Mapper) {}

  mapUserPOJOToUserDTO(userPOJO: UserPOJO): UserDTO {
    return this.classMapper.map(userPOJO, UserPOJO, UserDTO);
  }

  mapcustomerSignUpDTOToSaasCustomerAdminPOJO(
    customerSignUpDTO: CustomerSignUpDTO,
  ): SaasCustomerAdminPOJO {
    return this.classMapper.map(customerSignUpDTO, CustomerSignUpDTO, SaasCustomerAdminPOJO);
  }
}
