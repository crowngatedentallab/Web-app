export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  TECHNICIAN = 'TECHNICIAN'
}

export enum OrderStatus {
  SUBMITTED = 'Submitted',
  RECEIVED = 'Received',
  DESIGNING = 'Designing',
  MILLING = 'Milling',
  GLAZING = 'Glazing',
  QUALITY_CHECK = 'Quality Check',
  DISPATCHED = 'Dispatched',
  DELIVERED = 'Delivered'
}

export interface Order {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName?: string;
  toothNumber: string;
  shade: string;
  typeOfWork: string; // e.g., Zirconia, E-Max
  status: OrderStatus;
  submissionDate: string;
  dueDate: string;
  notes?: string;
  assignedTech?: string;
  priority: 'Normal' | 'Urgent';
}

export interface DashboardStats {
  totalActive: number;
  urgent: number;
  revenue: number;
  completionRate: number;
}