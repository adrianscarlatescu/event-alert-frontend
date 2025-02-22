import {TypeBaseDto} from './type-base.dto';

export type CategoryDto = {

  id: string;
  label: string;
  imagePath: string;
  position: number;
  types: TypeBaseDto[];

}
