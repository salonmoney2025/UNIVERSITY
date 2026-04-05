"""
Management command to seed default permissions
Defines the complete "Whole Base System" with all possible functionalities
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.authentication.rbac_models import Permission, RolePermission
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Seed default permissions for EBKUST University Management System'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing permissions before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing permissions...')
            Permission.objects.all().delete()
            RolePermission.objects.all().delete()

        self.stdout.write('Seeding permissions...')

        with transaction.atomic():
            # Create all permissions
            permissions = self._create_permissions()
            self.stdout.write(self.style.SUCCESS(f'Created {len(permissions)} permissions'))

            # Assign default permissions to roles
            self._assign_role_permissions()
            self.stdout.write(self.style.SUCCESS('Assigned role permissions'))

        self.stdout.write(self.style.SUCCESS('✅ Permission seeding completed!'))

    def _create_permissions(self):
        """Create all possible permissions in the system"""
        permissions_data = [
            # ACADEMIC PERMISSIONS
            {'code': 'VIEW_GRADES', 'name': 'View Grades', 'category': 'ACADEMIC', 'description': 'View student grades and academic records'},
            {'code': 'ENTER_GRADES', 'name': 'Enter Grades', 'category': 'ACADEMIC', 'description': 'Enter and update student grades', 'requires_approval': True},
            {'code': 'APPROVE_GRADES', 'name': 'Approve Grades', 'category': 'ACADEMIC', 'description': 'Approve student grades before publication'},
            {'code': 'VIEW_TIMETABLE', 'name': 'View Timetable', 'category': 'ACADEMIC', 'description': 'View class timetables'},
            {'code': 'MANAGE_TIMETABLE', 'name': 'Manage Timetable', 'category': 'ACADEMIC', 'description': 'Create and edit timetables'},
            {'code': 'ENROLL_COURSE', 'name': 'Enroll in Course', 'category': 'ACADEMIC', 'description': 'Enroll in courses'},
            {'code': 'MANAGE_COURSES', 'name': 'Manage Courses', 'category': 'ACADEMIC', 'description': 'Create, edit, delete courses'},
            {'code': 'VIEW_COURSE_ROSTER', 'name': 'View Course Roster', 'category': 'ACADEMIC', 'description': 'View list of students in a course'},
            {'code': 'SUBMIT_ASSIGNMENT', 'name': 'Submit Assignment', 'category': 'ACADEMIC', 'description': 'Submit assignments and coursework'},
            {'code': 'GRADE_ASSIGNMENT', 'name': 'Grade Assignment', 'category': 'ACADEMIC', 'description': 'Grade student assignments'},
            {'code': 'VIEW_TRANSCRIPT', 'name': 'View Transcript', 'category': 'ACADEMIC', 'description': 'View academic transcript'},
            {'code': 'GENERATE_TRANSCRIPT', 'name': 'Generate Transcript', 'category': 'ACADEMIC', 'description': 'Generate official transcripts'},

            # FINANCE PERMISSIONS
            {'code': 'VIEW_FINANCE_RECORDS', 'name': 'View Finance Records', 'category': 'FINANCE', 'description': 'View financial records and transactions'},
            {'code': 'MANAGE_PAYMENTS', 'name': 'Manage Payments', 'category': 'FINANCE', 'description': 'Record and manage payments'},
            {'code': 'GENERATE_RECEIPT', 'name': 'Generate Receipt', 'category': 'FINANCE', 'description': 'Generate payment receipts'},
            {'code': 'VERIFY_PAYMENT', 'name': 'Verify Payment', 'category': 'FINANCE', 'description': 'Verify payment transactions'},
            {'code': 'VIEW_FINANCE_REPORTS', 'name': 'View Finance Reports', 'category': 'FINANCE', 'description': 'View financial reports and analytics'},
            {'code': 'MANAGE_FEES', 'name': 'Manage Fees', 'category': 'FINANCE', 'description': 'Set and manage student fees'},
            {'code': 'PROCESS_REFUND', 'name': 'Process Refund', 'category': 'FINANCE', 'description': 'Process payment refunds', 'requires_approval': True},
            {'code': 'VIEW_PAYMENT_HISTORY', 'name': 'View Payment History', 'category': 'FINANCE', 'description': 'View payment transaction history'},

            # ADMIN PERMISSIONS
            {'code': 'MANAGE_USERS', 'name': 'Manage Users', 'category': 'ADMIN', 'description': 'Create, edit, delete users'},
            {'code': 'ASSIGN_ROLES', 'name': 'Assign Roles', 'category': 'ADMIN', 'description': 'Assign and change user roles'},
            {'code': 'MANAGE_PERMISSIONS', 'name': 'Manage Permissions', 'category': 'ADMIN', 'description': 'Assign and revoke permissions'},
            {'code': 'VIEW_AUDIT_LOGS', 'name': 'View Audit Logs', 'category': 'ADMIN', 'description': 'View system audit logs'},
            {'code': 'MANAGE_CAMPUSES', 'name': 'Manage Campuses', 'category': 'ADMIN', 'description': 'Create and manage campus locations'},
            {'code': 'MANAGE_DEPARTMENTS', 'name': 'Manage Departments', 'category': 'ADMIN', 'description': 'Create and manage departments'},
            {'code': 'MANAGE_FACULTIES', 'name': 'Manage Faculties', 'category': 'ADMIN', 'description': 'Create and manage faculties'},
            {'code': 'SYSTEM_SETTINGS', 'name': 'System Settings', 'category': 'ADMIN', 'description': 'Modify system-wide settings'},

            # STUDENT SERVICES PERMISSIONS
            {'code': 'VIEW_PROFILE', 'name': 'View Profile', 'category': 'STUDENT_SERVICES', 'description': 'View own profile'},
            {'code': 'UPDATE_PROFILE', 'name': 'Update Profile', 'category': 'STUDENT_SERVICES', 'description': 'Update own profile information'},
            {'code': 'VIEW_ID_CARD', 'name': 'View ID Card', 'category': 'STUDENT_SERVICES', 'description': 'View student ID card'},
            {'code': 'REQUEST_ID_CARD', 'name': 'Request ID Card', 'category': 'STUDENT_SERVICES', 'description': 'Request new ID card'},
            {'code': 'PRINT_ID_CARD', 'name': 'Print ID Card', 'category': 'STUDENT_SERVICES', 'description': 'Print student ID cards'},
            {'code': 'VIEW_NOTIFICATIONS', 'name': 'View Notifications', 'category': 'STUDENT_SERVICES', 'description': 'View system notifications'},
            {'code': 'SEND_NOTIFICATIONS', 'name': 'Send Notifications', 'category': 'STUDENT_SERVICES', 'description': 'Send notifications to users'},

            # REGISTRY PERMISSIONS
            {'code': 'MANAGE_ADMISSIONS', 'name': 'Manage Admissions', 'category': 'REGISTRY', 'description': 'Manage student admissions'},
            {'code': 'VERIFY_DOCUMENTS', 'name': 'Verify Documents', 'category': 'REGISTRY', 'description': 'Verify submitted documents'},
            {'code': 'GENERATE_LETTERS', 'name': 'Generate Letters', 'category': 'REGISTRY', 'description': 'Generate official letters'},
            {'code': 'SIGN_LETTERS', 'name': 'Sign Letters', 'category': 'REGISTRY', 'description': 'Digitally sign official letters', 'requires_approval': True},
            {'code': 'MANAGE_MATRICULATION', 'name': 'Manage Matriculation', 'category': 'REGISTRY', 'description': 'Manage matriculation process'},
            {'code': 'MANAGE_GRADUATION', 'name': 'Manage Graduation', 'category': 'REGISTRY', 'description': 'Manage graduation process'},
            {'code': 'VIEW_STUDENT_RECORDS', 'name': 'View Student Records', 'category': 'REGISTRY', 'description': 'View complete student records'},
            {'code': 'EDIT_STUDENT_RECORDS', 'name': 'Edit Student Records', 'category': 'REGISTRY', 'description': 'Edit student records', 'requires_approval': True},

            # HR PERMISSIONS
            {'code': 'MANAGE_STAFF', 'name': 'Manage Staff', 'category': 'HR', 'description': 'Manage staff records'},
            {'code': 'VIEW_STAFF_RECORDS', 'name': 'View Staff Records', 'category': 'HR', 'description': 'View staff employment records'},
            {'code': 'MANAGE_PAYROLL', 'name': 'Manage Payroll', 'category': 'HR', 'description': 'Manage staff payroll'},
            {'code': 'MANAGE_LEAVE', 'name': 'Manage Leave', 'category': 'HR', 'description': 'Manage staff leave requests'},
            {'code': 'VIEW_BENEFITS', 'name': 'View Benefits', 'category': 'HR', 'description': 'View staff benefits'},

            # LIBRARY PERMISSIONS
            {'code': 'BORROW_BOOKS', 'name': 'Borrow Books', 'category': 'LIBRARY', 'description': 'Borrow library books'},
            {'code': 'MANAGE_LIBRARY', 'name': 'Manage Library', 'category': 'LIBRARY', 'description': 'Manage library resources'},
            {'code': 'VIEW_LIBRARY_CATALOG', 'name': 'View Library Catalog', 'category': 'LIBRARY', 'description': 'Search library catalog'},

            # EXAMS PERMISSIONS
            {'code': 'VIEW_EXAM_SCHEDULE', 'name': 'View Exam Schedule', 'category': 'EXAMS', 'description': 'View examination schedule'},
            {'code': 'MANAGE_EXAMS', 'name': 'Manage Exams', 'category': 'EXAMS', 'description': 'Create and manage examinations'},
            {'code': 'SUBMIT_EXAM', 'name': 'Submit Exam', 'category': 'EXAMS', 'description': 'Submit exam answers'},
            {'code': 'GRADE_EXAM', 'name': 'Grade Exam', 'category': 'EXAMS', 'description': 'Grade examination papers'},
            {'code': 'VIEW_EXAM_RESULTS', 'name': 'View Exam Results', 'category': 'EXAMS', 'description': 'View examination results'},
            {'code': 'PUBLISH_RESULTS', 'name': 'Publish Results', 'category': 'EXAMS', 'description': 'Publish exam results', 'requires_approval': True},
        ]

        created_permissions = []
        for perm_data in permissions_data:
            perm, created = Permission.objects.get_or_create(
                code=perm_data['code'],
                defaults=perm_data
            )
            if created:
                created_permissions.append(perm)
                self.stdout.write(f'  Created: {perm.code}')
            else:
                self.stdout.write(f'  Exists: {perm.code}')

        return created_permissions

    def _assign_role_permissions(self):
        """Assign default permissions to each role"""

        # Define role-permission mappings
        role_permissions = {
            # STUDENT - Default access space
            'STUDENT': [
                'VIEW_GRADES', 'VIEW_TIMETABLE', 'ENROLL_COURSE', 'VIEW_COURSE_ROSTER',
                'SUBMIT_ASSIGNMENT', 'VIEW_TRANSCRIPT', 'VIEW_FINANCE_RECORDS',
                'VIEW_PAYMENT_HISTORY', 'VIEW_PROFILE', 'UPDATE_PROFILE',
                'VIEW_ID_CARD', 'REQUEST_ID_CARD', 'VIEW_NOTIFICATIONS',
                'VIEW_EXAM_SCHEDULE', 'SUBMIT_EXAM', 'VIEW_EXAM_RESULTS',
                'BORROW_BOOKS', 'VIEW_LIBRARY_CATALOG',
            ],

            # LECTURER - Course management and grading
            'LECTURER': [
                'VIEW_GRADES', 'ENTER_GRADES', 'VIEW_TIMETABLE', 'MANAGE_TIMETABLE',
                'VIEW_COURSE_ROSTER', 'GRADE_ASSIGNMENT', 'VIEW_STUDENT_RECORDS',
                'GRADE_EXAM', 'VIEW_EXAM_SCHEDULE', 'VIEW_EXAM_RESULTS',
                'VIEW_LIBRARY_CATALOG', 'VIEW_PROFILE', 'UPDATE_PROFILE',
                'VIEW_NOTIFICATIONS',
            ],

            # FINANCE - Financial operations
            'FINANCE': [
                'VIEW_FINANCE_RECORDS', 'MANAGE_PAYMENTS', 'GENERATE_RECEIPT',
                'VERIFY_PAYMENT', 'VIEW_FINANCE_REPORTS', 'MANAGE_FEES',
                'PROCESS_REFUND', 'VIEW_PAYMENT_HISTORY', 'VIEW_PROFILE',
                'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # REGISTRY - Student records and admissions
            'REGISTRY': [
                'MANAGE_ADMISSIONS', 'VERIFY_DOCUMENTS', 'GENERATE_LETTERS',
                'MANAGE_MATRICULATION', 'VIEW_STUDENT_RECORDS', 'EDIT_STUDENT_RECORDS',
                'VIEW_PROFILE', 'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # DEAN - Academic oversight
            'DEAN': [
                'VIEW_GRADES', 'ENTER_GRADES', 'APPROVE_GRADES', 'VIEW_TIMETABLE',
                'MANAGE_TIMETABLE', 'MANAGE_COURSES', 'VIEW_COURSE_ROSTER',
                'VIEW_TRANSCRIPT', 'GENERATE_TRANSCRIPT', 'VIEW_STUDENT_RECORDS',
                'GENERATE_LETTERS', 'SIGN_LETTERS', 'MANAGE_EXAMS', 'GRADE_EXAM',
                'PUBLISH_RESULTS', 'VIEW_PROFILE', 'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # SUPER_ADMIN - Full access to everything
            'SUPER_ADMIN': 'ALL',  # Special marker for all permissions

            # ADMIN - System administration
            'ADMIN': [
                'MANAGE_USERS', 'ASSIGN_ROLES', 'VIEW_AUDIT_LOGS', 'MANAGE_CAMPUSES',
                'MANAGE_DEPARTMENTS', 'MANAGE_FACULTIES', 'SYSTEM_SETTINGS',
                'VIEW_GRADES', 'VIEW_FINANCE_REPORTS', 'VIEW_STUDENT_RECORDS',
                'MANAGE_ADMISSIONS', 'GENERATE_LETTERS', 'MANAGE_STAFF',
                'VIEW_PROFILE', 'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # ID_CARD_PRINTING - ID card operations
            'ID_CARD_PRINTING': [
                'VIEW_ID_CARD', 'PRINT_ID_CARD', 'VIEW_STUDENT_RECORDS',
                'VIEW_PROFILE', 'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # LIBRARY - Library management
            'LIBRARY': [
                'BORROW_BOOKS', 'MANAGE_LIBRARY', 'VIEW_LIBRARY_CATALOG',
                'VIEW_PROFILE', 'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],

            # HUMAN_RESOURCES - HR operations
            'HUMAN_RESOURCES': [
                'MANAGE_STAFF', 'VIEW_STAFF_RECORDS', 'MANAGE_PAYROLL',
                'MANAGE_LEAVE', 'VIEW_BENEFITS', 'VIEW_PROFILE',
                'UPDATE_PROFILE', 'VIEW_NOTIFICATIONS',
            ],
        }

        # Get super admin user for granted_by
        super_admin = User.objects.filter(role='SUPER_ADMIN').first()

        # Assign permissions to roles
        for role, permissions in role_permissions.items():
            if permissions == 'ALL':
                # Super admin gets all permissions
                all_perms = Permission.objects.filter(is_active=True)
                for perm in all_perms:
                    RolePermission.objects.get_or_create(
                        role=role,
                        permission=perm,
                        defaults={'granted_by': super_admin, 'can_delegate': True}
                    )
                self.stdout.write(f'  {role}: ALL permissions assigned')
            else:
                # Assign specific permissions
                for perm_code in permissions:
                    try:
                        perm = Permission.objects.get(code=perm_code, is_active=True)
                        RolePermission.objects.get_or_create(
                            role=role,
                            permission=perm,
                            defaults={'granted_by': super_admin}
                        )
                    except Permission.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f'  Warning: Permission {perm_code} not found'))

                self.stdout.write(f'  {role}: {len(permissions)} permissions assigned')
