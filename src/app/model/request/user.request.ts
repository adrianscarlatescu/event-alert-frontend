import {Gender} from '../../enums/gender';
import {Role} from '../../enums/role';

export class UserRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  imagePath: string;
  gender: Gender;
  roles: Role[];
}
