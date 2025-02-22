import {RoleDto} from './role.dto';
import {GenderDto} from './gender.dto';

export type UserDto = {

  id: number;
  joinedAt: Date;
  modifiedAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  gender: GenderDto;
  dateOfBirth: Date;
  phoneNumber: string;
  imagePath: string;
  roles: RoleDto[];
  reportsNumber: number;

}
