"""
Comprehensive Django management command to seed database with all user roles and sample data
Includes: Students, Staff, Lecturers, HODs, Deans, HR, Admins, and Notification Templates
"""
import random
from datetime import date, timedelta, datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from apps.authentication.models import User
from apps.campuses.models import Campus, Department, Faculty
from apps.courses.models import Program, Course, CourseOffering
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.communications.models import Notification, SMSLog, EmailLog
from apps.letters.models import LetterTemplate, LetterSignature


class Command(BaseCommand):
    help = 'Comprehensive database seeding with all roles and sample data'

    def __init__(self):
        super().__init__()
        self.fake = Faker()
        self.created_objects = {
            'super_admins': 0,
            'campus_admins': 0,
            'deans': 0,
            'hods': 0,
            'hr_staff': 0,
            'registry_staff': 0,
            'finance_staff': 0,
            'lecturers': 0,
            'students': 0,
            'campuses': 0,
            'faculties': 0,
            'departments': 0,
            'programs': 0,
            'courses': 0,
            'notifications': 0,
            'letter_templates': 0,
            'signatures': 0,
        }

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Delete existing data before seeding',
        )
        parser.add_argument(
            '--students',
            type=int,
            default=200,
            help='Number of students to create (default: 200)',
        )
        parser.add_argument(
            '--lecturers',
            type=int,
            default=50,
            help='Number of lecturers to create (default: 50)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('COMPREHENSIVE DATABASE SEEDING'))
        self.stdout.write(self.style.SUCCESS('Ernest Bai Koroma University of Science and Technology'))
        self.stdout.write(self.style.SUCCESS('=' * 80))

        num_students = options['students']
        num_lecturers = options['lecturers']

        if options['flush']:
            self.stdout.write(self.style.WARNING('\nFlushing existing data...'))
            self.flush_data()

        try:
            with transaction.atomic():
                # 1. Create Campus Infrastructure
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 1: CAMPUS INFRASTRUCTURE'))
                self.stdout.write('=' * 80)
                campus = self.create_campus_structure()

                # 2. Create Administrative Staff
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 2: ADMINISTRATIVE STAFF'))
                self.stdout.write('=' * 80)
                self.create_administrative_staff(campus)

                # 3. Create Academic Programs
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 3: ACADEMIC PROGRAMS'))
                self.stdout.write('=' * 80)
                programs = self.create_programs(campus)

                # 4. Create Courses
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 4: COURSE CATALOG'))
                self.stdout.write('=' * 80)
                courses = self.create_courses(campus)

                # 5. Create Lecturers
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS(f'STEP 5: LECTURERS ({num_lecturers} total)'))
                self.stdout.write('=' * 80)
                lecturers = self.create_lecturers(campus, num_lecturers)

                # 6. Create Students
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS(f'STEP 6: STUDENTS ({num_students} total)'))
                self.stdout.write('=' * 80)
                students = self.create_students(campus, programs, num_students)

                # 7. Create Course Offerings
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 7: COURSE OFFERINGS'))
                self.stdout.write('=' * 80)
                self.create_course_offerings(campus, courses, lecturers)

                # 8. Create Letter Templates
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 8: LETTER TEMPLATES'))
                self.stdout.write('=' * 80)
                self.create_letter_templates(campus)

                # 9. Create Signatures
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 9: DIGITAL SIGNATURES'))
                self.stdout.write('=' * 80)
                self.create_signatures(campus)

                # 10. Create Sample Notifications
                self.stdout.write('\n' + '=' * 80)
                self.stdout.write(self.style.SUCCESS('STEP 10: SAMPLE NOTIFICATIONS'))
                self.stdout.write('=' * 80)
                self.create_sample_notifications(students[:10])

            self.stdout.write('\n' + '=' * 80)
            self.stdout.write(self.style.SUCCESS('DATABASE SEEDING COMPLETED SUCCESSFULLY!'))
            self.stdout.write(self.style.SUCCESS('=' * 80))
            self.print_summary()
            self.print_access_credentials()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nERROR DURING SEEDING: {str(e)}'))
            import traceback
            traceback.print_exc()
            raise

    def flush_data(self):
        """Delete existing data"""
        self.stdout.write('  - Deleting students...')
        Student.objects.all().delete()

        self.stdout.write('  - Deleting staff...')
        StaffMember.objects.all().delete()

        self.stdout.write('  - Deleting course offerings...')
        CourseOffering.objects.all().delete()

        self.stdout.write('  - Deleting courses...')
        Course.objects.all().delete()

        self.stdout.write('  - Deleting programs...')
        Program.objects.all().delete()

        self.stdout.write('  - Deleting departments...')
        Department.objects.all().delete()

        self.stdout.write('  - Deleting faculties...')
        Faculty.objects.all().delete()

        self.stdout.write('  - Deleting campuses...')
        Campus.objects.all().delete()

        self.stdout.write('  - Deleting notifications...')
        Notification.objects.all().delete()
        SMSLog.objects.all().delete()
        EmailLog.objects.all().delete()

        self.stdout.write('  - Deleting letter templates...')
        LetterTemplate.objects.all().delete()
        LetterSignature.objects.all().delete()

        self.stdout.write('  - Deleting users (except superusers)...')
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write(self.style.WARNING('  ✓ All data flushed successfully'))

    def create_campus_structure(self):
        """Create campus, faculties, and departments"""
        # Create Main Campus
        campus, created = Campus.objects.get_or_create(
            code='EBKUST',
            defaults={
                'name': 'Ernest Bai Koroma University of Science and Technology',
                'address': 'Main Campus, Magburaka',
                'city': 'Magburaka',
                'state': 'Tonkolili District',
                'country': 'Sierra Leone',
                'phone': '+23276555000',
                'email': 'info@ebkustsl.edu.sl',
                'website': 'https://portal.ebkustsl.edu.sl',
                'is_active': True,
            }
        )
        if created:
            self.created_objects['campuses'] += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ Campus: {campus.name}'))

        # Create Faculties
        faculties_data = [
            {'name': 'Faculty of Engineering', 'code': 'FOE', 'description': 'Engineering programs including Computer Science, Electrical, Civil, and Mechanical Engineering'},
            {'name': 'Faculty of Science', 'code': 'FOS', 'description': 'Pure and Applied Sciences including Mathematics, Physics, Chemistry, and Biology'},
            {'name': 'Faculty of Business Administration', 'code': 'FOBA', 'description': 'Business programs including Accounting, Marketing, Management, and Finance'},
            {'name': 'Faculty of Education', 'code': 'FOED', 'description': 'Teacher training and educational programs'},
            {'name': 'Faculty of Medicine', 'code': 'FOM', 'description': 'Medical and health sciences programs'},
            {'name': 'Faculty of Arts', 'code': 'FOA', 'description': 'Humanities and social sciences programs'},
        ]

        faculties = []
        for faculty_data in faculties_data:
            faculty, created = Faculty.objects.get_or_create(
                campus=campus,
                code=faculty_data['code'],
                defaults={
                    'name': faculty_data['name'],
                    'description': faculty_data['description'],
                }
            )
            if created:
                self.created_objects['faculties'] += 1
            faculties.append(faculty)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Faculty: {faculty.name}'))

        # Create Departments
        departments_data = [
            # Faculty of Engineering
            {'name': 'Computer Science', 'code': 'CS', 'faculty_code': 'FOE'},
            {'name': 'Electrical Engineering', 'code': 'EE', 'faculty_code': 'FOE'},
            {'name': 'Civil Engineering', 'code': 'CE', 'faculty_code': 'FOE'},
            {'name': 'Mechanical Engineering', 'code': 'ME', 'faculty_code': 'FOE'},

            # Faculty of Science
            {'name': 'Mathematics', 'code': 'MATH', 'faculty_code': 'FOS'},
            {'name': 'Physics', 'code': 'PHY', 'faculty_code': 'FOS'},
            {'name': 'Chemistry', 'code': 'CHEM', 'faculty_code': 'FOS'},
            {'name': 'Biology', 'code': 'BIO', 'faculty_code': 'FOS'},

            # Faculty of Business
            {'name': 'Accounting', 'code': 'ACC', 'faculty_code': 'FOBA'},
            {'name': 'Management', 'code': 'MGT', 'faculty_code': 'FOBA'},
            {'name': 'Marketing', 'code': 'MKT', 'faculty_code': 'FOBA'},
            {'name': 'Finance', 'code': 'FIN', 'faculty_code': 'FOBA'},

            # Faculty of Education
            {'name': 'Educational Psychology', 'code': 'EDPSY', 'faculty_code': 'FOED'},
            {'name': 'Curriculum Studies', 'code': 'CURR', 'faculty_code': 'FOED'},

            # Faculty of Medicine
            {'name': 'Medicine', 'code': 'MED', 'faculty_code': 'FOM'},
            {'name': 'Nursing', 'code': 'NURS', 'faculty_code': 'FOM'},

            # Faculty of Arts
            {'name': 'English', 'code': 'ENG', 'faculty_code': 'FOA'},
            {'name': 'History', 'code': 'HIST', 'faculty_code': 'FOA'},
        ]

        departments = []
        for dept_data in departments_data:
            faculty = Faculty.objects.get(campus=campus, code=dept_data['faculty_code'])
            dept, created = Department.objects.get_or_create(
                campus=campus,
                code=dept_data['code'],
                defaults={
                    'name': dept_data['name'],
                    'description': f'{dept_data["name"]} Department',
                }
            )
            if created:
                self.created_objects['departments'] += 1
            departments.append(dept)
            self.stdout.write(f'    - Department: {dept.name}')

        return campus

    def create_administrative_staff(self, campus):
        """Create all administrative roles"""
        faculties = Faculty.objects.filter(campus=campus)
        departments = Department.objects.filter(campus=campus)

        # 1. Super Admins
        self.stdout.write('\n  Creating Super Admins...')
        super_admins = [
            {'email': 'superadmin@ebkustsl.edu.sl', 'first_name': 'Super', 'last_name': 'Administrator', 'gender': 'MALE'},
            {'email': 'admin@ebkustsl.edu.sl', 'first_name': 'System', 'last_name': 'Admin', 'gender': 'FEMALE'},
        ]

        for admin_data in super_admins:
            user, created = User.objects.get_or_create(
                email=admin_data['email'],
                defaults={
                    'first_name': admin_data['first_name'],
                    'last_name': admin_data['last_name'],
                    'phone': f'+23276{random.randint(100000, 999999)}',
                    'gender': admin_data['gender'],
                    'role': 'SUPER_ADMIN',
                    'campus': campus,
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                    'date_of_birth': date(1970, 1, 1),
                }
            )
            if created:
                user.set_password('admin123')
                user.save()
                self.created_objects['super_admins'] += 1
                self.stdout.write(self.style.SUCCESS(f'    ✓ {admin_data["email"]} (Password: admin123)'))

        # 2. Campus Admin
        self.stdout.write('\n  Creating Campus Administrator...')
        user, created = User.objects.get_or_create(
            email='campus.admin@ebkustsl.edu.sl',
            defaults={
                'first_name': 'Campus',
                'last_name': 'Administrator',
                'phone': '+23276100001',
                'gender': 'MALE',
                'role': 'CAMPUS_ADMIN',
                'campus': campus,
                'is_staff': True,
                'is_active': True,
                'date_of_birth': date(1975, 6, 15),
            }
        )
        if created:
            user.set_password('campus123')
            user.save()
            self.created_objects['campus_admins'] += 1
            self.stdout.write(self.style.SUCCESS(f'    ✓ {user.email} (Password: campus123)'))

        # 3. Deans for each Faculty
        self.stdout.write('\n  Creating Deans...')
        for faculty in faculties:
            email = f'dean.{faculty.code.lower()}@ebkustsl.edu.sl'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': f'Dean',
                    'last_name': faculty.code,
                    'phone': f'+23276{random.randint(200000, 299999)}',
                    'gender': random.choice(['MALE', 'FEMALE']),
                    'role': 'DEAN',
                    'campus': campus,
                    'is_staff': True,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=40, maximum_age=65),
                }
            )
            if created:
                user.set_password('dean123')
                user.save()
                self.created_objects['deans'] += 1
                self.stdout.write(self.style.SUCCESS(f'    ✓ {email} - {faculty.name} (Password: dean123)'))

        # 4. HODs for each Department
        self.stdout.write('\n  Creating Heads of Department...')
        for dept in departments:
            email = f'hod.{dept.code.lower()}@ebkustsl.edu.sl'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'HOD',
                    'last_name': dept.code,
                    'phone': f'+23276{random.randint(300000, 399999)}',
                    'gender': random.choice(['MALE', 'FEMALE']),
                    'role': 'HEAD_OF_DEPARTMENT',
                    'campus': campus,
                    'is_staff': True,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=35, maximum_age=60),
                }
            )
            if created:
                user.set_password('hod123')
                user.save()

                # Create StaffMember profile
                StaffMember.objects.get_or_create(
                    user=user,
                    defaults={
                        'staff_id': f'HOD{dept.code}',
                        'campus': campus,
                        'department': dept,
                        'designation': 'Head of Department',
                        'employment_type': 'FULL_TIME',
                        'hire_date': date.today() - timedelta(days=random.randint(1095, 5475)),
                        'salary': Decimal(random.randint(120000, 180000)),
                        'qualifications': f'PhD in {dept.name}',
                        'specialization': dept.name,
                        'office_location': f'{dept.name} Building, Office 001',
                        'status': 'ACTIVE',
                    }
                )

                self.created_objects['hods'] += 1
                self.stdout.write(f'    ✓ {email} - {dept.name} (Password: hod123)')

        # 5. HR Staff
        self.stdout.write('\n  Creating Human Resources Staff...')
        hr_roles = [
            {'email': 'hr.manager@ebkustsl.edu.sl', 'first_name': 'HR', 'last_name': 'Manager', 'role': 'HUMAN_RESOURCES'},
            {'email': 'hr.staff1@ebkustsl.edu.sl', 'first_name': 'HR', 'last_name': 'Staff 1', 'role': 'HUMAN_RESOURCES'},
            {'email': 'hr.staff2@ebkustsl.edu.sl', 'first_name': 'HR', 'last_name': 'Staff 2', 'role': 'HUMAN_RESOURCES'},
        ]

        for hr_data in hr_roles:
            user, created = User.objects.get_or_create(
                email=hr_data['email'],
                defaults={
                    'first_name': hr_data['first_name'],
                    'last_name': hr_data['last_name'],
                    'phone': f'+23276{random.randint(400000, 499999)}',
                    'gender': random.choice(['MALE', 'FEMALE']),
                    'role': hr_data['role'],
                    'campus': campus,
                    'is_staff': True,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=30, maximum_age=55),
                }
            )
            if created:
                user.set_password('hr123')
                user.save()
                self.created_objects['hr_staff'] += 1
                self.stdout.write(self.style.SUCCESS(f'    ✓ {user.email} (Password: hr123)'))

        # 6. Registry Staff
        self.stdout.write('\n  Creating Registry Staff...')
        registry_roles = [
            {'email': 'registry.admin@ebkustsl.edu.sl', 'first_name': 'Registry', 'last_name': 'Admin', 'role': 'REGISTRY_ADMIN'},
            {'email': 'registry.admission@ebkustsl.edu.sl', 'first_name': 'Registry', 'last_name': 'Admission', 'role': 'REGISTRY_ADMISSION'},
            {'email': 'registry.academic@ebkustsl.edu.sl', 'first_name': 'Registry', 'last_name': 'Academic', 'role': 'REGISTRY_ACADEMIC'},
            {'email': 'registry.staff@ebkustsl.edu.sl', 'first_name': 'Registry', 'last_name': 'Staff', 'role': 'REGISTRY'},
        ]

        for reg_data in registry_roles:
            user, created = User.objects.get_or_create(
                email=reg_data['email'],
                defaults={
                    'first_name': reg_data['first_name'],
                    'last_name': reg_data['last_name'],
                    'phone': f'+23276{random.randint(500000, 599999)}',
                    'gender': random.choice(['MALE', 'FEMALE']),
                    'role': reg_data['role'],
                    'campus': campus,
                    'is_staff': True,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=28, maximum_age=50),
                }
            )
            if created:
                user.set_password('registry123')
                user.save()
                self.created_objects['registry_staff'] += 1
                self.stdout.write(self.style.SUCCESS(f'    ✓ {user.email} (Password: registry123)'))

        # 7. Finance Staff
        self.stdout.write('\n  Creating Finance Staff...')
        finance_roles = [
            {'email': 'finance.manager@ebkustsl.edu.sl', 'first_name': 'Finance', 'last_name': 'Manager', 'role': 'FINANCE'},
            {'email': 'accountant@ebkustsl.edu.sl', 'first_name': 'Chief', 'last_name': 'Accountant', 'role': 'ACCOUNTANT'},
            {'email': 'finance.staff1@ebkustsl.edu.sl', 'first_name': 'Finance', 'last_name': 'Staff 1', 'role': 'FINANCE_STAFF'},
            {'email': 'finance.staff2@ebkustsl.edu.sl', 'first_name': 'Finance', 'last_name': 'Staff 2', 'role': 'FINANCE_STAFF'},
        ]

        for fin_data in finance_roles:
            user, created = User.objects.get_or_create(
                email=fin_data['email'],
                defaults={
                    'first_name': fin_data['first_name'],
                    'last_name': fin_data['last_name'],
                    'phone': f'+23276{random.randint(600000, 699999)}',
                    'gender': random.choice(['MALE', 'FEMALE']),
                    'role': fin_data['role'],
                    'campus': campus,
                    'is_staff': True,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=30, maximum_age=55),
                }
            )
            if created:
                user.set_password('finance123')
                user.save()
                self.created_objects['finance_staff'] += 1
                self.stdout.write(self.style.SUCCESS(f'    ✓ {user.email} (Password: finance123)'))

        self.stdout.write(self.style.SUCCESS('\n  ✓ All administrative staff created successfully'))

    def create_programs(self, campus):
        """Create comprehensive academic programs"""
        departments = Department.objects.filter(campus=campus)

        programs_data = [
            # Engineering
            {'name': 'Bachelor of Computer Science', 'code': 'BCS', 'dept_code': 'CS', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Master of Computer Science', 'code': 'MCS', 'dept_code': 'CS', 'type': 'MASTER', 'years': 2, 'credits': 60},
            {'name': 'Bachelor of Electrical Engineering', 'code': 'BEE', 'dept_code': 'EE', 'type': 'BACHELOR', 'years': 5, 'credits': 150},
            {'name': 'Bachelor of Civil Engineering', 'code': 'BCE', 'dept_code': 'CE', 'type': 'BACHELOR', 'years': 5, 'credits': 150},
            {'name': 'Bachelor of Mechanical Engineering', 'code': 'BME', 'dept_code': 'ME', 'type': 'BACHELOR', 'years': 5, 'credits': 150},

            # Science
            {'name': 'Bachelor of Mathematics', 'code': 'BMATH', 'dept_code': 'MATH', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Physics', 'code': 'BPHY', 'dept_code': 'PHY', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Chemistry', 'code': 'BCHEM', 'dept_code': 'CHEM', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Biology', 'code': 'BBIO', 'dept_code': 'BIO', 'type': 'BACHELOR', 'years': 4, 'credits': 120},

            # Business
            {'name': 'Bachelor of Accounting', 'code': 'BAC', 'dept_code': 'ACC', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Management', 'code': 'BMGT', 'dept_code': 'MGT', 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Master of Business Administration', 'code': 'MBA', 'dept_code': 'MGT', 'type': 'MASTER', 'years': 2, 'credits': 60},

            # Medicine
            {'name': 'MBBS Medicine', 'code': 'MBBS', 'dept_code': 'MED', 'type': 'BACHELOR', 'years': 6, 'credits': 180},
            {'name': 'Bachelor of Nursing Science', 'code': 'BNS', 'dept_code': 'NURS', 'type': 'BACHELOR', 'years': 4, 'credits': 120},

            # Diplomas
            {'name': 'Diploma in Information Technology', 'code': 'DIT', 'dept_code': 'CS', 'type': 'DIPLOMA', 'years': 2, 'credits': 60},
            {'name': 'Diploma in Business Management', 'code': 'DBM', 'dept_code': 'MGT', 'type': 'DIPLOMA', 'years': 2, 'credits': 60},
        ]

        programs = []
        for prog_data in programs_data:
            try:
                dept = departments.get(code=prog_data['dept_code'])
                program, created = Program.objects.get_or_create(
                    code=prog_data['code'],
                    defaults={
                        'name': prog_data['name'],
                        'campus': campus,
                        'department': dept,
                        'degree_type': prog_data['type'],
                        'duration_years': prog_data['years'],
                        'total_credits': prog_data['credits'],
                        'description': f'{prog_data["name"]} - Comprehensive program offering world-class education',
                        'is_active': True,
                    }
                )
                if created:
                    self.created_objects['programs'] += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✓ {program.name}'))
                programs.append(program)
            except Department.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  ! Department {prog_data["dept_code"]} not found'))

        return programs

    def create_courses(self, campus):
        """Create comprehensive course catalog"""
        departments = Department.objects.filter(campus=campus)

        courses_data = [
            # Computer Science
            {'code': 'CS101', 'title': 'Introduction to Programming', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS102', 'title': 'Computer Organization', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS201', 'title': 'Data Structures and Algorithms', 'dept_code': 'CS', 'credits': 4},
            {'code': 'CS202', 'title': 'Object-Oriented Programming', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS301', 'title': 'Database Systems', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS302', 'title': 'Operating Systems', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS401', 'title': 'Software Engineering', 'dept_code': 'CS', 'credits': 3},
            {'code': 'CS402', 'title': 'Artificial Intelligence', 'dept_code': 'CS', 'credits': 4},

            # Mathematics
            {'code': 'MATH101', 'title': 'Calculus I', 'dept_code': 'MATH', 'credits': 4},
            {'code': 'MATH102', 'title': 'Calculus II', 'dept_code': 'MATH', 'credits': 4},
            {'code': 'MATH201', 'title': 'Linear Algebra', 'dept_code': 'MATH', 'credits': 3},
            {'code': 'MATH202', 'title': 'Discrete Mathematics', 'dept_code': 'MATH', 'credits': 3},
            {'code': 'MATH301', 'title': 'Differential Equations', 'dept_code': 'MATH', 'credits': 3},
            {'code': 'MATH401', 'title': 'Advanced Calculus', 'dept_code': 'MATH', 'credits': 4},

            # Engineering
            {'code': 'EE101', 'title': 'Circuit Analysis I', 'dept_code': 'EE', 'credits': 4},
            {'code': 'EE201', 'title': 'Electronics I', 'dept_code': 'EE', 'credits': 3},
            {'code': 'CE101', 'title': 'Engineering Drawing', 'dept_code': 'CE', 'credits': 3},
            {'code': 'CE201', 'title': 'Structural Analysis', 'dept_code': 'CE', 'credits': 4},

            # Business
            {'code': 'ACC101', 'title': 'Financial Accounting I', 'dept_code': 'ACC', 'credits': 3},
            {'code': 'ACC102', 'title': 'Financial Accounting II', 'dept_code': 'ACC', 'credits': 3},
            {'code': 'ACC201', 'title': 'Managerial Accounting', 'dept_code': 'ACC', 'credits': 3},
            {'code': 'MGT101', 'title': 'Principles of Management', 'dept_code': 'MGT', 'credits': 3},
            {'code': 'MGT201', 'title': 'Organizational Behavior', 'dept_code': 'MGT', 'credits': 3},

            # General Education
            {'code': 'GEN101', 'title': 'English Composition', 'dept_code': 'ENG', 'credits': 2},
            {'code': 'GEN102', 'title': 'Communication Skills', 'dept_code': 'ENG', 'credits': 2},
            {'code': 'GEN103', 'title': 'Introduction to Philosophy', 'dept_code': 'ENG', 'credits': 2},
        ]

        courses = []
        for course_data in courses_data:
            try:
                dept = departments.get(code=course_data['dept_code'])
                course, created = Course.objects.get_or_create(
                    code=course_data['code'],
                    defaults={
                        'title': course_data['title'],
                        'campus': campus,
                        'department': dept,
                        'credits': course_data['credits'],
                        'description': f'{course_data["title"]} - Comprehensive course covering essential topics and practical applications',
                        'syllabus': f'Week 1-4: Introduction\nWeek 5-8: Core Concepts\nWeek 9-12: Advanced Topics\nWeek 13-15: Projects and Review',
                        'is_active': True,
                    }
                )
                if created:
                    self.created_objects['courses'] += 1
                    self.stdout.write(f'  ✓ {course.code} - {course.title}')
                courses.append(course)
            except Department.DoesNotExist:
                pass

        return courses

    def create_lecturers(self, campus, num_lecturers):
        """Create lecturer accounts with staff profiles"""
        departments = list(Department.objects.filter(campus=campus))

        designations = [
            'Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer',
            'Assistant Lecturer', 'Teaching Assistant', 'Lab Technician', 'Research Fellow'
        ]

        lecturers = []
        for i in range(num_lecturers):
            gender = random.choice(['MALE', 'FEMALE'])
            first_name = self.fake.first_name_male() if gender == 'MALE' else self.fake.first_name_female()
            last_name = self.fake.last_name()
            email = f'{first_name.lower()}.{last_name.lower()}@ebkustsl.edu.sl'

            # Create User
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': f'+23276{random.randint(700000, 799999)}',
                    'gender': gender,
                    'role': 'LECTURER',
                    'campus': campus,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=28, maximum_age=65),
                }
            )

            if user_created:
                user.set_password('lecturer123')
                user.save()

            # Create StaffMember profile
            designation = random.choice(designations)
            dept = random.choice(departments)

            staff, staff_created = StaffMember.objects.get_or_create(
                user=user,
                defaults={
                    'staff_id': f'LEC{20000 + i:05d}',
                    'campus': campus,
                    'department': dept,
                    'designation': designation,
                    'employment_type': random.choice(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
                    'hire_date': date.today() - timedelta(days=random.randint(365, 5475)),
                    'salary': Decimal(random.randint(60000, 180000)),
                    'qualifications': f'{random.choice(["PhD", "MSc", "BSc", "MPhil"])} in {dept.name}',
                    'specialization': dept.name,
                    'office_location': f'{dept.name} Building, Office {random.randint(100, 500)}',
                    'status': 'ACTIVE',
                }
            )

            if staff_created:
                self.created_objects['lecturers'] += 1
                lecturers.append(staff)
                if (i + 1) % 10 == 0:
                    self.stdout.write(f'  ✓ Created {i + 1}/{num_lecturers} lecturers')

        self.stdout.write(self.style.SUCCESS(f'  ✓ Total lecturers created: {len(lecturers)}'))
        return lecturers

    def create_students(self, campus, programs, num_students):
        """Create student accounts with profiles"""
        blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        enrollment_statuses = ['ACTIVE'] * 8 + ['SUSPENDED', 'DEFERRED']  # 80% active

        students = []
        for i in range(num_students):
            gender = random.choice(['MALE', 'FEMALE'])
            first_name = self.fake.first_name_male() if gender == 'MALE' else self.fake.first_name_female()
            last_name = self.fake.last_name()
            email = f'{first_name.lower()}.{last_name.lower()}{random.randint(100, 999)}@student.ebkustsl.edu.sl'

            # Create User
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': f'+23277{random.randint(100000, 999999)}',
                    'gender': gender,
                    'role': 'STUDENT',
                    'campus': campus,
                    'is_active': True,
                    'date_of_birth': self.fake.date_of_birth(minimum_age=17, maximum_age=35),
                }
            )

            if user_created:
                user.set_password('student123')
                user.save()

            # Create Student profile
            program = random.choice(programs)
            dept = program.department
            matric_number = f'{30000 + i:05d}'  # Starting from 30000

            student, student_created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': matric_number,
                    'campus': campus,
                    'department': dept,
                    'program': program,
                    'admission_date': date.today() - timedelta(days=random.randint(30, 1825)),
                    'enrollment_status': random.choice(enrollment_statuses),
                    'current_semester': random.randint(1, 8),
                    'gpa': Decimal(random.uniform(2.0, 4.0)).quantize(Decimal('0.01')),
                    'guardian_name': f'{self.fake.first_name()} {self.fake.last_name()}',
                    'guardian_phone': f'+23276{random.randint(100000, 999999)}',
                    'guardian_email': self.fake.email(),
                    'blood_group': random.choice(blood_groups),
                    'address': self.fake.address(),
                    'emergency_contact': f'+23277{random.randint(100000, 999999)}',
                }
            )

            if student_created:
                self.created_objects['students'] += 1
                students.append(student)
                if (i + 1) % 50 == 0:
                    self.stdout.write(f'  ✓ Created {i + 1}/{num_students} students')

        self.stdout.write(self.style.SUCCESS(f'  ✓ Total students created: {len(students)}'))
        return students

    def create_course_offerings(self, campus, courses, lecturers):
        """Create course offerings for current academic year"""
        current_year = timezone.now().year
        academic_year = f'{current_year}/{current_year + 1}'
        semesters = ['Fall', 'Spring']
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        times = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00']

        for course in courses:
            semester = random.choice(semesters)
            instructor = random.choice(lecturers) if lecturers else None

            CourseOffering.objects.get_or_create(
                course=course,
                semester=semester,
                academic_year=academic_year,
                campus=campus,
                defaults={
                    'instructor': instructor,
                    'schedule': {
                        random.choice(days): random.choice(times),
                        random.choice(days): random.choice(times),
                    },
                    'room': f'Room {random.randint(101, 450)}',
                    'max_students': random.randint(30, 150),
                    'enrolled_count': random.randint(0, 30),
                    'status': random.choice(['OPEN', 'OPEN', 'OPEN', 'CLOSED']),
                }
            )
            self.stdout.write(f'  ✓ {course.code} - {semester} {academic_year}')

    def create_letter_templates(self, campus):
        """Create comprehensive letter templates"""
        templates_data = [
            {
                'code': 'ADMISSION_LETTER',
                'name': 'Admission Letter',
                'description': 'Formal admission letter for accepted students',
                'content': '''Dear {{student_name}},

We are pleased to inform you that you have been offered admission to {{program_name}} at {{campus_name}} for the {{academic_year}} academic year.

Your matriculation number is: {{student_id}}

Please complete your registration by {{registration_deadline}}.

Congratulations!

{{signature}}
Registrar'''
            },
            {
                'code': 'OFFER_LETTER',
                'name': 'Offer Letter',
                'description': 'Job offer letter for staff',
                'content': '''Dear {{staff_name}},

We are pleased to offer you the position of {{designation}} in the {{department_name}} at {{campus_name}}.

Start Date: {{start_date}}
Salary: {{salary}}

Please confirm your acceptance by {{response_deadline}}.

{{signature}}
Human Resources'''
            },
            {
                'code': 'TRANSCRIPT',
                'name': 'Official Transcript',
                'description': 'Academic transcript for students',
                'content': '''OFFICIAL TRANSCRIPT

Student: {{student_name}}
ID: {{student_id}}
Program: {{program_name}}
GPA: {{gpa}}

{{course_list}}

{{signature}}
Registrar'''
            },
            {
                'code': 'CERTIFICATE',
                'name': 'Completion Certificate',
                'description': 'Certificate of program completion',
                'content': '''CERTIFICATE OF COMPLETION

This is to certify that

{{student_name}}

has successfully completed the requirements for

{{program_name}}

on {{completion_date}}.

{{signature}}
Dean, {{faculty_name}}'''
            },
        ]

        for template_data in templates_data:
            template, created = LetterTemplate.objects.get_or_create(
                code=template_data['code'],
                defaults={
                    'name': template_data['name'],
                    'description': template_data['description'],
                    'content': template_data['content'],
                    'category': 'ACADEMIC',
                    'required_fields': ['student_name', 'student_id', 'campus_name'],
                    'is_active': True,
                }
            )
            if created:
                self.created_objects['letter_templates'] += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ {template.name}'))

    def create_signatures(self, campus):
        """Create digital signatures for letter signing"""
        signatures_data = [
            {'name': 'Registrar', 'title': 'University Registrar', 'department': 'Registry'},
            {'name': 'Vice Chancellor', 'title': 'Vice Chancellor', 'department': 'Administration'},
            {'name': 'Dean of Students', 'title': 'Dean of Students Affairs', 'department': 'Student Affairs'},
        ]

        for sig_data in signatures_data:
            signature, created = LetterSignature.objects.get_or_create(
                name=sig_data['name'],
                defaults={
                    'title': sig_data['title'],
                    'department': sig_data['department'],
                    'is_active': True,
                }
            )
            if created:
                self.created_objects['signatures'] += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ {signature.name} - {signature.title}'))

    def create_sample_notifications(self, students):
        """Create sample notifications for testing"""
        notification_types = ['INFO', 'WARNING', 'ALERT', 'ANNOUNCEMENT']
        priorities = ['LOW', 'MEDIUM', 'HIGH']

        notifications_data = [
            {
                'title': 'Welcome to EBKUST',
                'message': 'Welcome to Ernest Bai Koroma University of Science and Technology. We wish you a successful academic journey!',
                'type': 'ANNOUNCEMENT',
                'priority': 'HIGH',
            },
            {
                'title': 'Fee Payment Reminder',
                'message': 'This is a reminder to complete your tuition fee payment before the deadline.',
                'type': 'WARNING',
                'priority': 'HIGH',
            },
            {
                'title': 'Course Registration Open',
                'message': 'Course registration for the new semester is now open. Please register your courses through the student portal.',
                'type': 'INFO',
                'priority': 'MEDIUM',
            },
            {
                'title': 'Examination Timetable Released',
                'message': 'The examination timetable for this semester has been released. Check the portal for details.',
                'type': 'ALERT',
                'priority': 'HIGH',
            },
            {
                'title': 'Library Hours Extended',
                'message': 'The university library will extend its operating hours during the examination period.',
                'type': 'INFO',
                'priority': 'LOW',
            },
        ]

        for student in students:
            for notif_data in notifications_data:
                notification = Notification.objects.create(
                    recipient_user=student.user,
                    title=notif_data['title'],
                    message=notif_data['message'],
                    notification_type=notif_data['type'],
                    priority=notif_data['priority'],
                    is_read=random.choice([True, False]),
                    sent_at=timezone.now() - timedelta(days=random.randint(0, 30)),
                )
                self.created_objects['notifications'] += 1

        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {self.created_objects["notifications"]} sample notifications'))

        # Create sample SMS logs
        for student in students[:5]:
            SMSLog.objects.create(
                recipient_phone=student.user.phone,
                message=f'Dear {student.user.first_name}, your course registration is confirmed. Student ID: {student.student_id}',
                status=random.choice(['SENT', 'DELIVERED', 'FAILED']),
                sent_at=timezone.now() - timedelta(days=random.randint(0, 7)),
                cost=Decimal('0.05'),
            )

        # Create sample email logs
        for student in students[:5]:
            EmailLog.objects.create(
                recipient_email=student.user.email,
                subject='Course Registration Confirmation',
                body=f'Dear {student.user.first_name},\n\nYour course registration has been successfully completed.\n\nStudent ID: {student.student_id}\nProgram: {student.program.name}\n\nThank you.',
                status=random.choice(['SENT', 'DELIVERED']),
                sent_at=timezone.now() - timedelta(days=random.randint(0, 7)),
            )

        self.stdout.write(self.style.SUCCESS('  ✓ Created sample SMS and Email logs'))

    def print_summary(self):
        """Print comprehensive summary"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('SEEDING SUMMARY'))
        self.stdout.write('=' * 80)

        categories = [
            ('Administrative Staff', [
                ('Super Admins', self.created_objects['super_admins']),
                ('Campus Admins', self.created_objects['campus_admins']),
                ('Deans', self.created_objects['deans']),
                ('Heads of Department', self.created_objects['hods']),
                ('HR Staff', self.created_objects['hr_staff']),
                ('Registry Staff', self.created_objects['registry_staff']),
                ('Finance Staff', self.created_objects['finance_staff']),
            ]),
            ('Academic Staff', [
                ('Lecturers', self.created_objects['lecturers']),
            ]),
            ('Students', [
                ('Students', self.created_objects['students']),
            ]),
            ('Infrastructure', [
                ('Campuses', self.created_objects['campuses']),
                ('Faculties', self.created_objects['faculties']),
                ('Departments', self.created_objects['departments']),
            ]),
            ('Academic', [
                ('Programs', self.created_objects['programs']),
                ('Courses', self.created_objects['courses']),
            ]),
            ('Communications', [
                ('Notifications', self.created_objects['notifications']),
                ('Letter Templates', self.created_objects['letter_templates']),
                ('Signatures', self.created_objects['signatures']),
            ]),
        ]

        for category_name, items in categories:
            self.stdout.write(f'\n{category_name}:')
            self.stdout.write('-' * 40)
            for item_name, count in items:
                self.stdout.write(f'  {item_name}: {count}')

        total = sum(self.created_objects.values())
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS(f'TOTAL RECORDS CREATED: {total}'))
        self.stdout.write('=' * 80)

    def print_access_credentials(self):
        """Print access credentials for testing"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('ACCESS CREDENTIALS'))
        self.stdout.write('=' * 80)

        credentials = [
            ('Super Admin', 'superadmin@ebkustsl.edu.sl', 'admin123'),
            ('System Admin', 'admin@ebkustsl.edu.sl', 'admin123'),
            ('Campus Admin', 'campus.admin@ebkustsl.edu.sl', 'campus123'),
            ('Dean', 'dean.foe@ebkustsl.edu.sl', 'dean123'),
            ('HOD', 'hod.cs@ebkustsl.edu.sl', 'hod123'),
            ('HR Manager', 'hr.manager@ebkustsl.edu.sl', 'hr123'),
            ('Registry Admin', 'registry.admin@ebkustsl.edu.sl', 'registry123'),
            ('Finance Manager', 'finance.manager@ebkustsl.edu.sl', 'finance123'),
            ('Lecturer', '[firstname].[lastname]@ebkustsl.edu.sl', 'lecturer123'),
            ('Student', '[firstname].[lastname][number]@student.ebkustsl.edu.sl', 'student123'),
        ]

        self.stdout.write('\nDefault login credentials for different roles:\n')
        for role, email, password in credentials:
            self.stdout.write(f'{role:20} | {email:45} | {password}')

        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('DATABASE READY FOR TESTING!'))
        self.stdout.write('=' * 80)
