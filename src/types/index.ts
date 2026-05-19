export type Program = 'TL' | 'TE' | 'TM' | 'TA';

export type Status = 'not_started' | 'in_progress' | 'completed';

export interface Demand {
  id: string;
  description: string;
  createdAt: Date;
  deliveryDate: Date | null;
  status: Status;
  notes?: string;
  links?: string[];
}

export interface ProductService {
  id: string;
  name: string;
  status: Status;
  createdAt: Date;
  deliveryDate: Date | null;
  demands: Demand[];
}

export interface Candidate {
  id: string;
  name: string;
  city: string;
  state: string;
  programs: Program[];
  productsServices: ProductService[];
}

export interface DashboardFilters {
  programs: Program[];
  status: Status[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  search: string;
  cities: string[];
  states: string[];
}

export interface KPIData {
  totalCandidates: number;
  totalDemands: number;
  totalProductsServices: number;
  completionPercentage: number;
}
