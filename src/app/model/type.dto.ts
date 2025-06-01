import {CategoryDto} from './category.dto';

export type TypeDto = {

  id: string;
  label: string;
  imagePath: string;
  position: number;
  category: CategoryDto;

}
