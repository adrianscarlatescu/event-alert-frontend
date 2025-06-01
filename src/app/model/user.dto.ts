import {RoleDto} from './role.dto';

export type UserDto = {

  id: number;
  joinedAt: Date;
  modifiedAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  imagePath: string;
  roles: RoleDto[];
  reportsNumber: number;

}
