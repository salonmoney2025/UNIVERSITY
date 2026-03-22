"""
Django management command to seed the database with comprehensive test data
"""
import random
from datetime import date, timedelta
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


class Command(BaseCommand):
    help = 'Seed database with comprehensive test data'

    def __init__(self):
        super().__init__()
        self.fake = Faker()
        self.created_objects = {
            'users': 0,
            'campuses': 0,
            'faculties': 0,
            'departments': 0,
            'programs': 0,
            'courses': 0,
            'staff': 0,
            'students': 0,
        }

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Delete existing data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))
        self.stdout.write(self.style.SUCCESS('=' * 70))

        if options['flush']:
            self.stdout.write(self.style.WARNING('Flushing existing data...'))
            self.flush_data()

        try:
            with transaction.atomic():
                # 1. Create Super Admins
                self.stdout.write('\n1. Creating Super Admins...')
                self.create_super_admins()

                # 2. Create Campus Infrastructure
                self.stdout.write('\n2. Creating Campus Infrastructure...')
                campus = self.create_campus_structure()

                # 3. Create Programs
                self.stdout.write('\n3. Creating Academic Programs...')
                programs = self.create_programs(campus)

                # 4. Create Courses
                self.stdout.write('\n4. Creating Courses...')
                courses = self.create_courses(campus)

                # 5. Create Staff
                self.stdout.write('\n5. Creating Staff Members...')
                staff = self.create_staff(campus)

                # 6. Create Students
                self.stdout.write('\n6. Creating Students...')
                self.create_students(campus, programs)

                # 7. Create Course Offerings
                self.stdout.write('\n7. Creating Course Offerings...')
                self.create_course_offerings(campus, courses, staff)

            self.stdout.write(self.style.SUCCESS('\n' + '=' * 70))
            self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
            self.stdout.write(self.style.SUCCESS('=' * 70))
            self.print_summary()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nError during seeding: {str(e)}'))
            raise

    def flush_data(self):
        """Delete existing test data"""
        Student.objects.all().delete()
        StaffMember.objects.all().delete()
        CourseOffering.objects.all().delete()
        Course.objects.all().delete()
        Program.objects.all().delete()
        Department.objects.all().delete()
        Faculty.objects.all().delete()
        Campus.objects.all().delete()
        User.objects.filter(role__in=['STUDENT', 'LECTURER']).delete()
        self.stdout.write(self.style.WARNING('Existing data flushed'))

    def create_super_admins(self):
        """Create 2 Super Admin users"""
        super_admins = [
            {
                'email': 'superadmin1@university.edu',
                'password': '12345',
                'first_name': 'Super',
                'last_name': 'Admin 1',
                'phone': '+23276123456',
                'gender': 'MALE',
            },
            {
                'email': 'superadmin2@university.edu',
                'password': '12345',
                'first_name': 'Super',
                'last_name': 'Admin 2',
                'phone': '+23276123457',
                'gender': 'FEMALE',
            },
        ]

        for admin_data in super_admins:
            # Check if user exists
            if User.objects.filter(email=admin_data['email']).exists():
                self.stdout.write(self.style.WARNING(f'  - {admin_data["email"]} already exists'))
                continue

            # Use create_superuser method which handles password correctly
            user = User.objects.create_superuser(
                email=admin_data['email'],
                password=admin_data['password'],
                first_name=admin_data['first_name'],
                last_name=admin_data['last_name'],
                phone=admin_data['phone'],
                gender=admin_data['gender'],
                date_of_birth=date(1980, 1, 1),
            )
            self.created_objects['users'] += 1
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created {admin_data["email"]}'))

    def create_campus_structure(self):
        """Create campus, faculties, and departments"""
        # Create Campus
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
                'is_active': True,
            }
        )
        if created:
            self.created_objects['campuses'] += 1
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created campus: {campus.name}'))

        # Create Faculties
        faculties_data = [
            {'name': 'Faculty of Engineering', 'code': 'FOE'},
            {'name': 'Faculty of Science', 'code': 'FOS'},
            {'name': 'Faculty of Business Administration', 'code': 'FOBA'},
            {'name': 'Faculty of Education', 'code': 'FOED'},
        ]

        faculties = []
        for faculty_data in faculties_data:
            faculty, created = Faculty.objects.get_or_create(
                campus=campus,
                code=faculty_data['code'],
                defaults={
                    'name': faculty_data['name'],
                    'description': f'{faculty_data["name"]} at EBKUST',
                }
            )
            if created:
                self.created_objects['faculties'] += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created faculty: {faculty.name}'))
            faculties.append(faculty)

        # Create Departments
        departments_data = [
            # Engineering
            {'name': 'Computer Science', 'code': 'CS', 'faculty_idx': 0},
            {'name': 'Electrical Engineering', 'code': 'EE', 'faculty_idx': 0},
            {'name': 'Civil Engineering', 'code': 'CE', 'faculty_idx': 0},
            # Science
            {'name': 'Mathematics', 'code': 'MATH', 'faculty_idx': 1},
            {'name': 'Physics', 'code': 'PHY', 'faculty_idx': 1},
            {'name': 'Chemistry', 'code': 'CHEM', 'faculty_idx': 1},
            # Business
            {'name': 'Accounting', 'code': 'ACC', 'faculty_idx': 2},
            {'name': 'Management', 'code': 'MGT', 'faculty_idx': 2},
            # Education
            {'name': 'Educational Psychology', 'code': 'EDPSY', 'faculty_idx': 3},
            {'name': 'Curriculum Studies', 'code': 'CURR', 'faculty_idx': 3},
        ]

        departments = []
        for dept_data in departments_data:
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
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created department: {dept.name}'))
            departments.append(dept)

        return campus

    def create_programs(self, campus):
        """Create academic programs"""
        departments = list(Department.objects.filter(campus=campus))

        programs_data = [
            {'name': 'Bachelor of Computer Science', 'code': 'BCS', 'dept_idx': 0, 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Electrical Engineering', 'code': 'BEE', 'dept_idx': 1, 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Civil Engineering', 'code': 'BCE', 'dept_idx': 2, 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Mathematics', 'code': 'BMATH', 'dept_idx': 3, 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Bachelor of Accounting', 'code': 'BAC', 'dept_idx': 6, 'type': 'BACHELOR', 'years': 4, 'credits': 120},
            {'name': 'Master of Computer Science', 'code': 'MCS', 'dept_idx': 0, 'type': 'MASTER', 'years': 2, 'credits': 60},
            {'name': 'Diploma in Information Technology', 'code': 'DIT', 'dept_idx': 0, 'type': 'DIPLOMA', 'years': 2, 'credits': 60},
        ]

        programs = []
        for prog_data in programs_data:
            dept = departments[prog_data['dept_idx']]
            program, created = Program.objects.get_or_create(
                code=prog_data['code'],
                defaults={
                    'name': prog_data['name'],
                    'campus': campus,
                    'department': dept,
                    'degree_type': prog_data['type'],
                    'duration_years': prog_data['years'],
                    'total_credits': prog_data['credits'],
                    'description': f'{prog_data["name"]} program offering comprehensive education',
                    'is_active': True,
                }
            )
            if created:
                self.created_objects['programs'] += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created program: {program.name}'))
            programs.append(program)

        return programs

    def create_courses(self, campus):
        """Create courses"""
        departments = list(Department.objects.filter(campus=campus))

        courses_data = [
            # Computer Science
            {'code': 'CS101', 'title': 'Introduction to Programming', 'dept_idx': 0, 'credits': 3},
            {'code': 'CS201', 'title': 'Data Structures and Algorithms', 'dept_idx': 0, 'credits': 4},
            {'code': 'CS301', 'title': 'Database Systems', 'dept_idx': 0, 'credits': 3},
            {'code': 'CS401', 'title': 'Software Engineering', 'dept_idx': 0, 'credits': 3},
            # Mathematics
            {'code': 'MATH101', 'title': 'Calculus I', 'dept_idx': 3, 'credits': 4},
            {'code': 'MATH201', 'title': 'Linear Algebra', 'dept_idx': 3, 'credits': 3},
            {'code': 'MATH301', 'title': 'Differential Equations', 'dept_idx': 3, 'credits': 3},
            # Electrical Engineering
            {'code': 'EE101', 'title': 'Circuit Analysis', 'dept_idx': 1, 'credits': 4},
            {'code': 'EE201', 'title': 'Electronics', 'dept_idx': 1, 'credits': 3},
            # Accounting
            {'code': 'ACC101', 'title': 'Financial Accounting', 'dept_idx': 6, 'credits': 3},
            {'code': 'ACC201', 'title': 'Managerial Accounting', 'dept_idx': 6, 'credits': 3},
            # General
            {'code': 'GEN101', 'title': 'English Composition', 'dept_idx': 0, 'credits': 2},
            {'code': 'GEN102', 'title': 'Communication Skills', 'dept_idx': 0, 'credits': 2},
        ]

        courses = []
        for course_data in courses_data:
            dept = departments[course_data['dept_idx']]
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults={
                    'title': course_data['title'],
                    'campus': campus,
                    'department': dept,
                    'credits': course_data['credits'],
                    'description': f'{course_data["title"]} - Comprehensive course covering essential topics',
                    'syllabus': 'Detailed syllabus to be provided',
                    'is_active': True,
                }
            )
            if created:
                self.created_objects['courses'] += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created course: {course.code} - {course.title}'))
            courses.append(course)

        return courses

    def create_staff(self, campus):
        """Create 50 staff members with various designations"""
        departments = list(Department.objects.filter(campus=campus))

        designations = [
            'Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer',
            'Assistant Lecturer', 'Head of Department', 'Lab Technician'
        ]

        staff_members = []
        for i in range(50):
            # Generate staff data
            gender = random.choice(['MALE', 'FEMALE'])
            first_name = self.fake.first_name_male() if gender == 'MALE' else self.fake.first_name_female()
            last_name = self.fake.last_name()
            email = f'{first_name.lower()}.{last_name.lower()}@ebkustsl.edu.sl'

            # Create User
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                user_created = False
            else:
                user = User.objects.create_user(
                    email=email,
                    password='12345',
                    first_name=first_name,
                    last_name=last_name,
                    phone=f'+23276{random.randint(100000, 999999)}',
                    gender=gender,
                    role='LECTURER',
                    campus=campus,
                    is_active=True,
                    date_of_birth=self.fake.date_of_birth(minimum_age=30, maximum_age=65),
                )
                user_created = True
                self.created_objects['users'] += 1

            # Create StaffMember profile
            designation = random.choice(designations)
            dept = random.choice(departments)

            staff, staff_created = StaffMember.objects.get_or_create(
                user=user,
                defaults={
                    'staff_id': f'STF{12000 + i:05d}',
                    'campus': campus,
                    'department': dept,
                    'designation': designation,
                    'employment_type': random.choice(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
                    'hire_date': date.today() - timedelta(days=random.randint(365, 3650)),
                    'salary': Decimal(random.randint(50000, 150000)),
                    'qualifications': f'{random.choice(["PhD", "MSc", "BSc"])} in {dept.name}',
                    'specialization': dept.name,
                    'office_location': f'Office {random.randint(100, 500)}',
                    'status': 'ACTIVE',
                }
            )

            if staff_created:
                self.created_objects['staff'] += 1
                staff_members.append(staff)
                if (i + 1) % 10 == 0:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created {i + 1}/50 staff members'))

        self.stdout.write(self.style.SUCCESS(f'  ✓ Total staff created: {len(staff_members)}'))
        return staff_members

    def create_students(self, campus, programs):
        """Create 100 students with matriculation numbers starting from 12000"""
        departments = list(Department.objects.filter(campus=campus))

        for i in range(100):
            # Generate student data
            gender = random.choice(['MALE', 'FEMALE'])
            first_name = self.fake.first_name_male() if gender == 'MALE' else self.fake.first_name_female()
            last_name = self.fake.last_name()
            email = f'{first_name.lower()}.{last_name.lower()}{random.randint(100, 999)}@student.ebkustsl.edu.sl'

            # Create User
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                user_created = False
            else:
                user = User.objects.create_user(
                    email=email,
                    password='12345',
                    first_name=first_name,
                    last_name=last_name,
                    phone=f'+23276{random.randint(100000, 999999)}',
                    gender=gender,
                    role='STUDENT',
                    campus=campus,
                    is_active=True,
                    date_of_birth=self.fake.date_of_birth(minimum_age=18, maximum_age=30),
                )
                user_created = True
                self.created_objects['users'] += 1

            # Create Student profile
            program = random.choice(programs)
            dept = program.department

            # Matriculation number: 5 digits starting from 12000
            matric_number = f'{12000 + i:05d}'

            student, student_created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': matric_number,
                    'campus': campus,
                    'department': dept,
                    'program': program,
                    'admission_date': date.today() - timedelta(days=random.randint(30, 1460)),
                    'enrollment_status': random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED', 'DEFERRED']),  # Most active
                    'current_semester': random.randint(1, 8),
                    'gpa': Decimal(random.uniform(2.0, 4.0)).quantize(Decimal('0.01')),
                    'guardian_name': f'{self.fake.first_name()} {self.fake.last_name()}',
                    'guardian_phone': f'+23276{random.randint(100000, 999999)}',
                    'guardian_email': self.fake.email(),
                    'blood_group': random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                    'address': self.fake.address(),
                    'emergency_contact': f'+23276{random.randint(100000, 999999)}',
                }
            )

            if student_created:
                self.created_objects['students'] += 1
                if (i + 1) % 20 == 0:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created {i + 1}/100 students'))

        self.stdout.write(self.style.SUCCESS(f'  ✓ Total students created: 100'))

    def create_course_offerings(self, campus, courses, staff):
        """Create course offerings for the current semester"""
        current_year = timezone.now().year
        academic_year = f'{current_year}/{current_year + 1}'

        for course in courses[:10]:  # Create offerings for first 10 courses
            instructor = random.choice(staff) if staff else None

            CourseOffering.objects.get_or_create(
                course=course,
                semester='Fall',
                academic_year=academic_year,
                campus=campus,
                defaults={
                    'instructor': instructor,
                    'schedule': {
                        'Monday': '10:00-12:00',
                        'Wednesday': '10:00-12:00',
                    },
                    'room': f'Room {random.randint(101, 350)}',
                    'max_students': random.randint(30, 100),
                    'enrolled_count': random.randint(0, 30),
                    'status': 'OPEN',
                }
            )

    def print_summary(self):
        """Print summary of created objects"""
        self.stdout.write(self.style.SUCCESS('\nCreated Objects Summary:'))
        self.stdout.write(self.style.SUCCESS('-' * 40))
        for obj_type, count in self.created_objects.items():
            self.stdout.write(f'  {obj_type.title()}: {count}')
        self.stdout.write(self.style.SUCCESS('-' * 40))
