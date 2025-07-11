
export interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  province_id: string;
  city_id: string;
  address?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  description?: string;
  child_capacity?: number;
  children_total?: number;
  boys_count?: number;
  girls_count?: number;
  schooling_rate?: number;
  annual_disease_rate?: number;
  meals_per_day?: number;
  legal_status?: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
  documents?: any;
  photo_url?: string;
  location_gps?: any;
  dhis2_orgunit_id?: string;
  created_by?: string;
}

export interface OrphanageFormData {
  centerName: string;
  capacity: string;
  provinceId: string;
  cityId: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
  children_total: string;
  boys_count: string;
  girls_count: string;
  schooling_rate: string;
  annual_disease_rate: string;
  meals_per_day: string;
}

export const schoolingRateOptions = [
  { value: '0', label: '0%' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
];

export const annualDiseaseRateOptions = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
];

export const mealsPerDayOptions = [
  { value: '1', label: '1 repas' },
  { value: '2', label: '2 repas' },
  { value: '3', label: '3 repas' },
  { value: '4', label: '4 repas' },
  { value: '5', label: '5 repas' },
];
