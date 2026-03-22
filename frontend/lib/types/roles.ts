/**
 * User Roles Type Definitions - EBKUST Portal Integration
 * 40 comprehensive user roles with full type safety
 */

export const USER_ROLES = {
  // Top-level Administration
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CAMPUS_ADMIN: 'CAMPUS_ADMIN',
  CHANCELLOR: 'CHANCELLOR',

  // Academic Roles
  DEAN: 'DEAN',
  HEAD_OF_DEPARTMENT: 'HEAD_OF_DEPARTMENT',
  LECTURER: 'LECTURER',
  PART_TIME_LECTURER: 'PART_TIME_LECTURER',
  FACULTY_ADMIN: 'FACULTY_ADMIN',
  FACULTY_EXAM: 'FACULTY_EXAM',

  // Registry Roles
  REGISTRY_ADMIN: 'REGISTRY_ADMIN',
  REGISTRY: 'REGISTRY',
  REGISTRY_ADMISSION: 'REGISTRY_ADMISSION',
  REGISTRY_HR: 'REGISTRY_HR',
  REGISTRY_ACADEMIC: 'REGISTRY_ACADEMIC',

  // Finance Roles
  FINANCE: 'FINANCE',
  FINANCE_STAFF: 'FINANCE_STAFF',
  FINANCE_SECRETARIAT: 'FINANCE_SECRETARIAT',
  FINANCE_SECRETARIAT_STAFF: 'FINANCE_SECRETARIAT_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',

  // Student Services
  STUDENT_SECTION: 'STUDENT_SECTION',
  STUDENT_SECTION_STAFF: 'STUDENT_SECTION_STAFF',
  STUDENT_WARDEN: 'STUDENT_WARDEN',

  // Business & Operations
  BUSINESS_CENTER: 'BUSINESS_CENTER',
  CAMPUS_BUSINESS_CENTER: 'CAMPUS_BUSINESS_CENTER',

  // Support Services
  LIBRARY: 'LIBRARY',
  ID_CARD_PRINTING: 'ID_CARD_PRINTING',
  HELP_DESK: 'HELP_DESK',
  HUMAN_RESOURCES: 'HUMAN_RESOURCES',

  // Specialized Programs
  ELEARNING_ADMIN: 'ELEARNING_ADMIN',
  SPS_ADMIN: 'SPS_ADMIN',
  SPS_STAFF: 'SPS_STAFF',
  EXTRAMURAL_STUDIES: 'EXTRAMURAL_STUDIES',

  // Examination
  EXAMS: 'EXAMS',

  // End Users
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CAMPUS_ADMIN: 'Campus Admin',
  CHANCELLOR: 'Chancellor',
  DEAN: 'Dean',
  HEAD_OF_DEPARTMENT: 'Head of Department',
  LECTURER: 'Lecturer',
  PART_TIME_LECTURER: 'Part-Time Lecturer',
  FACULTY_ADMIN: 'Faculty Admin',
  FACULTY_EXAM: 'Faculty Exam',
  REGISTRY_ADMIN: 'Registry Admin',
  REGISTRY: 'Registry',
  REGISTRY_ADMISSION: 'Registry Admission',
  REGISTRY_HR: 'Registry HR',
  REGISTRY_ACADEMIC: 'Registry Academic',
  FINANCE: 'Finance',
  FINANCE_STAFF: 'Finance Staff',
  FINANCE_SECRETARIAT: 'Finance Secretariat',
  FINANCE_SECRETARIAT_STAFF: 'Finance Secretariat Staff',
  ACCOUNTANT: 'Accountant',
  STUDENT_SECTION: 'Student Section',
  STUDENT_SECTION_STAFF: 'Student Section Staff',
  STUDENT_WARDEN: 'Student Warden',
  BUSINESS_CENTER: 'Business Center',
  CAMPUS_BUSINESS_CENTER: 'Campus Business Center',
  LIBRARY: 'Library',
  ID_CARD_PRINTING: 'ID Card Printing',
  HELP_DESK: 'Help Desk',
  HUMAN_RESOURCES: 'Human Resources',
  ELEARNING_ADMIN: 'eLearning Admin',
  SPS_ADMIN: 'SPS Admin',
  SPS_STAFF: 'SPS Staff',
  EXTRAMURAL_STUDIES: 'Extramural Studies',
  EXAMS: 'Exams',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

// Role Groups for easier permission checking
export const ROLE_GROUPS = {
  ADMIN_ROLES: [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.CAMPUS_ADMIN,
    USER_ROLES.CHANCELLOR,
  ],
  REGISTRY_ROLES: [
    USER_ROLES.REGISTRY_ADMIN,
    USER_ROLES.REGISTRY,
    USER_ROLES.REGISTRY_ADMISSION,
    USER_ROLES.REGISTRY_HR,
    USER_ROLES.REGISTRY_ACADEMIC,
  ],
  FINANCE_ROLES: [
    USER_ROLES.FINANCE,
    USER_ROLES.FINANCE_STAFF,
    USER_ROLES.FINANCE_SECRETARIAT,
    USER_ROLES.FINANCE_SECRETARIAT_STAFF,
    USER_ROLES.ACCOUNTANT,
  ],
  ACADEMIC_ROLES: [
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
    USER_ROLES.LECTURER,
    USER_ROLES.PART_TIME_LECTURER,
    USER_ROLES.FACULTY_ADMIN,
    USER_ROLES.FACULTY_EXAM,
  ],
  BUSINESS_ROLES: [
    USER_ROLES.BUSINESS_CENTER,
    USER_ROLES.CAMPUS_BUSINESS_CENTER,
  ],
  STUDENT_SERVICE_ROLES: [
    USER_ROLES.STUDENT_SECTION,
    USER_ROLES.STUDENT_SECTION_STAFF,
    USER_ROLES.STUDENT_WARDEN,
  ],
  SUPPORT_ROLES: [
    USER_ROLES.LIBRARY,
    USER_ROLES.ID_CARD_PRINTING,
    USER_ROLES.HELP_DESK,
    USER_ROLES.HUMAN_RESOURCES,
  ],
  SPECIALIZED_ROLES: [
    USER_ROLES.ELEARNING_ADMIN,
    USER_ROLES.SPS_ADMIN,
    USER_ROLES.SPS_STAFF,
    USER_ROLES.EXTRAMURAL_STUDIES,
  ],
} as const;

// User interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  campus?: {
    id: string;
    name: string;
    code: string;
  };
  phone?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  photo?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
}

// Permission checking functions
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdminUser(user: User | null): boolean {
  return hasRole(user, ROLE_GROUPS.ADMIN_ROLES);
}

export function isAcademicStaff(user: User | null): boolean {
  return hasRole(user, ROLE_GROUPS.ACADEMIC_ROLES);
}

export function isFinanceUser(user: User | null): boolean {
  return hasRole(user, ROLE_GROUPS.FINANCE_ROLES);
}

export function isRegistryUser(user: User | null): boolean {
  return hasRole(user, ROLE_GROUPS.REGISTRY_ROLES);
}

export function isBusinessCenterUser(user: User | null): boolean {
  return hasRole(user, ROLE_GROUPS.BUSINESS_ROLES);
}

export function canManageStudents(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    ...ROLE_GROUPS.ADMIN_ROLES,
    ...ROLE_GROUPS.REGISTRY_ROLES,
    ...ROLE_GROUPS.STUDENT_SERVICE_ROLES,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
  ]);
}

export function canManageExams(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    ...ROLE_GROUPS.ADMIN_ROLES,
    USER_ROLES.EXAMS,
    USER_ROLES.FACULTY_EXAM,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
    USER_ROLES.REGISTRY_ACADEMIC,
  ]);
}

export function canManageFinance(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    ...ROLE_GROUPS.ADMIN_ROLES,
    ...ROLE_GROUPS.FINANCE_ROLES,
    ...ROLE_GROUPS.BUSINESS_ROLES,
  ]);
}

export function canViewFinancialReports(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.CHANCELLOR,
    USER_ROLES.FINANCE,
    USER_ROLES.FINANCE_SECRETARIAT,
    USER_ROLES.ACCOUNTANT,
    USER_ROLES.BUSINESS_CENTER,
  ]);
}

export function canGenerateLetters(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    ...ROLE_GROUPS.ADMIN_ROLES,
    ...ROLE_GROUPS.REGISTRY_ROLES,
    USER_ROLES.DEAN,
  ]);
}

export function canSignLetters(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.CHANCELLOR,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
    USER_ROLES.REGISTRY_ADMIN,
  ]);
}

export function canManagePins(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    ...ROLE_GROUPS.ADMIN_ROLES,
    ...ROLE_GROUPS.BUSINESS_ROLES,
    USER_ROLES.FINANCE,
  ]);
}

export function canEnterGrades(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    USER_ROLES.LECTURER,
    USER_ROLES.PART_TIME_LECTURER,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
  ]);
}

export function canApproveGrades(user: User | null): boolean {
  if (!user) return false;
  return hasRole(user, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
    USER_ROLES.REGISTRY_ACADEMIC,
  ]);
}

// Module access permissions
export type Module =
  | 'dashboard'
  | 'students'
  | 'staff'
  | 'courses'
  | 'exams'
  | 'finance'
  | 'letters'
  | 'business_center'
  | 'communications'
  | 'hr'
  | 'library'
  | 'help_desk'
  | 'elearning'
  | 'sps'
  | 'analytics'
  | 'settings';

export function canAccessModule(user: User | null, module: Module): boolean {
  if (!user) return false;

  const modulePermissions: Record<Module, UserRole[]> = {
    dashboard: Object.values(USER_ROLES),
    students: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.REGISTRY_ROLES,
      ...ROLE_GROUPS.ACADEMIC_ROLES,
      ...ROLE_GROUPS.STUDENT_SERVICE_ROLES,
    ],
    staff: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      USER_ROLES.HUMAN_RESOURCES,
      USER_ROLES.REGISTRY_HR,
    ],
    courses: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.ACADEMIC_ROLES,
      ...ROLE_GROUPS.REGISTRY_ROLES,
      USER_ROLES.STUDENT,
    ],
    exams: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.ACADEMIC_ROLES,
      ...ROLE_GROUPS.REGISTRY_ROLES,
      USER_ROLES.EXAMS,
    ],
    finance: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.FINANCE_ROLES,
      ...ROLE_GROUPS.BUSINESS_ROLES,
    ],
    letters: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.REGISTRY_ROLES,
      USER_ROLES.DEAN,
    ],
    business_center: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.BUSINESS_ROLES,
      ...ROLE_GROUPS.FINANCE_ROLES,
    ],
    communications: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.ACADEMIC_ROLES,
    ],
    hr: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      USER_ROLES.HUMAN_RESOURCES,
      USER_ROLES.REGISTRY_HR,
    ],
    library: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      USER_ROLES.LIBRARY,
      USER_ROLES.STUDENT,
    ],
    help_desk: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      USER_ROLES.HELP_DESK,
    ],
    elearning: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.ACADEMIC_ROLES,
      USER_ROLES.ELEARNING_ADMIN,
      USER_ROLES.STUDENT,
    ],
    sps: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      ...ROLE_GROUPS.SPECIALIZED_ROLES,
    ],
    analytics: [
      ...ROLE_GROUPS.ADMIN_ROLES,
      USER_ROLES.CHANCELLOR,
      USER_ROLES.DEAN,
    ],
    settings: Object.values(USER_ROLES),
  };

  const allowedRoles = modulePermissions[module] || [];
  return hasRole(user, allowedRoles);
}

// Dashboard routes based on role
export function getDefaultDashboardRoute(user: User | null): string {
  if (!user) return '/login';

  switch (user.role) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.ADMIN:
    case USER_ROLES.CAMPUS_ADMIN:
      return '/admin-dashboard';

    case USER_ROLES.CHANCELLOR:
      return '/chancellor-dashboard';

    case USER_ROLES.DEAN:
    case USER_ROLES.HEAD_OF_DEPARTMENT:
      return '/academic-dashboard';

    case USER_ROLES.LECTURER:
    case USER_ROLES.PART_TIME_LECTURER:
      return '/lecturer-dashboard';

    case USER_ROLES.FINANCE:
    case USER_ROLES.FINANCE_STAFF:
    case USER_ROLES.ACCOUNTANT:
      return '/finance-dashboard';

    case USER_ROLES.BUSINESS_CENTER:
    case USER_ROLES.CAMPUS_BUSINESS_CENTER:
      return '/business-center-dashboard';

    case USER_ROLES.REGISTRY_ADMIN:
    case USER_ROLES.REGISTRY:
    case USER_ROLES.REGISTRY_ADMISSION:
      return '/registry-dashboard';

    case USER_ROLES.STUDENT:
      return '/student-portal/dashboard';

    case USER_ROLES.PARENT:
      return '/parent-dashboard';

    default:
      return '/dashboard';
  }
}
