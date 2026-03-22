// User and Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  photo?: string;
  role: UserRole;
  campus?: string;
  is_active: boolean;
  created_at: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DEAN'
  | 'LECTURER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'CAMPUS_ADMIN';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  role: UserRole;
  campus?: string;
}

// Campus Types
export interface Campus {
  id: string;
  name: string;
  code: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  campus: string;
  head_of_department?: string;
  description?: string;
}

// Student Types
export interface Student {
  id: string;
  user: User;
  student_id: string;
  campus: string;
  department: string;
  program: string;
  admission_date: string;
  enrollment_status: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN' | 'DEFERRED';
  current_semester: number;
  gpa: number;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
}

// Staff Types
export interface StaffMember {
  id: string;
  user: User;
  staff_id: string;
  campus: string;
  department: string;
  position: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'ADJUNCT';
  hire_date: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'RETIRED';
  salary: string;
}

// Course Types
export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  campus: string;
  department: string;
  is_elective: boolean;
  is_active: boolean;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  degree_type: 'CERTIFICATE' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE';
  duration_semesters: number;
  campus: string;
  department: string;
  is_active: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  student_fee: string;
  amount: string;
  payment_method: PaymentMethod;
  transaction_id: string;
  payment_date: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  receipt_number: string;
}

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'STRIPE'
  | 'PAYPAL'
  | 'FLUTTERWAVE'
  | 'PAYSTACK';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// Dashboard Types
export interface DashboardStats {
  total_students: number;
  total_staff: number;
  total_courses: number;
  pending_payments: number;
}
