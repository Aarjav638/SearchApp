export interface Crime {
  id: string;
  case_number: string;
  date: string;
  block: string;
  iucr: string;
  primary_type: string;
  description: string;
  location_description: string;
  arrest: boolean;
  domestic: boolean;
  beat: string;
  district: string;
  ward: string;
  community_area: string;
  fbi_code: string;
  x_coordinate: string;
  y_coordinate: string;
  year: string;
  updated_on: string;
  latitude: string;
  longitude: string;
  location: location;
}
export interface location {
  latitude: string;
  longitude: string;
  human_address: string;
}
