import {SeverityDto} from '../../../model/severity.dto';
import {TypeDto} from '../../../model/type.dto';
import {StatusDto} from '../../../model/status.dto';

export type FilterOptions = {

  radius: number;
  startDate: Date;
  endDate: Date;
  types: TypeDto[];
  severities: SeverityDto[];
  statuses: StatusDto[];

}
