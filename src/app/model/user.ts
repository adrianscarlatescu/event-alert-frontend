import {UserRole} from './user.role';
import {Gender} from './gender';

export class User {
  id: number;
  joinDateTime: Date;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  imagePath: string;
  gender: Gender;
  reportsNumber: number;
  userRoles: UserRole[];
}
