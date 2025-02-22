import {CategoryBaseDto} from './category-base.dto';

export type TypeDto = {

  id: string;
  label: string;
  imagePath: string;
  position: number;
  category: CategoryBaseDto;

}
