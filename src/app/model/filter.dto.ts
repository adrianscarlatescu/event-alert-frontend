export type FilterDto = {

  radius: number;
  startDate: Date;
  endDate: Date;
  latitude: number;
  longitude: number;
  typeIds: string[];
  severityIds: string[];
  statusIds: string[];

}
