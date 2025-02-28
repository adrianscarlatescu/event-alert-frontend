import {RoleId} from '../enums/id/role-id';

export type RoleDto = {

  id: RoleId;
  label: string;
  description: string;
  position: number;

}
