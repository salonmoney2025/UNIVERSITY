# RabbitMQ & Notification System - Complete Setup Guide

## 📋 Table of Contents
- [Overview](#overview)
- [RabbitMQ Setup](#rabbitmq-setup)
- [Celery Task Queue](#celery-task-queue)
- [Notification System](#notification-system)
- [SMS Integration](#sms-integration)
- [Email Integration](#email-integration)
- [Letter Generation](#letter-generation)
- [Testing](#testing)

---

## 🎯 Overview

The EBKUST University Management System uses **RabbitMQ** as a message broker for asynchronous task processing through **Celery**. This enables:

- **Async Notifications**: Send emails, SMS without blocking user requests
- **Background Jobs**: Letter generation, report processing, bulk operations
- **Scheduled Tasks**: Automated reminders, deadline notifications
- **Scalability**: Handle thousands of concurrent operations

### Architecture Flow:
```
User Request → Django Backend → RabbitMQ Queue → Celery Worker → Task Execution
                                     ↓
                               Redis (Results)
```

---

## 🐰 RabbitMQ Setup

### 1. Installation via Docker (Recommended)

RabbitMQ is already configured in `docker-compose.yml`:

```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  container_name: university_rabbitmq
  environment:
    RABBITMQ_DEFAULT_USER: guest
    RABBITMQ_DEFAULT_PASS: guest
  ports:
    - "5672:5672"      # AMQP protocol
    - "15672:15672"    # Management UI
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 30s
    timeout: 10s
    retries: 5
```

### 2. Start RabbitMQ

```bash
# Using Docker Compose
cd C:\Users\Wisdom\source\repos\UNIVERSITY
docker-compose up -d rabbitmq

# Check status
docker-compose ps rabbitmq

# View logs
docker-compose logs -f rabbitmq
```

### 3. Access Management UI

- **URL**: http://localhost:15672
- **Username**: `guest`
- **Password**: `guest`

**Management UI Features:**
- Queue monitoring
- Message tracking
- Connection management
- Performance metrics
- Exchange configuration

### 4. Verify RabbitMQ is Running

```bash
# Check if RabbitMQ is accepting connections
telnet localhost 5672

# Or use Docker
docker exec -it university_rabbitmq rabbitmq-diagnostics ping
```

---

## ⚙️ Celery Task Queue

### 1. Celery Configuration

**File**: `backend/config/celery.py`

```python
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic Tasks
app.conf.beat_schedule = {
    'send-deadline-reminders': {
        'task': 'apps.communications.tasks.send_deadline_reminders',
        'schedule': crontab(hour=8, minute=0),  # Every day at 8 AM
    },
    'cleanup-expired-pins': {
        'task': 'apps.business_center.tasks.cleanup_expired_pins',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
    },
}
```

### 2. Start Celery Worker

```bash
# Navigate to backend
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend

# Activate virtual environment
venv\Scripts\activate

# Start Celery worker
celery -A config worker -l info --pool=solo

# For Windows with better compatibility
celery -A config worker -l info --pool=solo -E
```

### 3. Start Celery Beat (Scheduler)

```bash
# In a separate terminal
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend
venv\Scripts\activate

# Start beat scheduler
celery -A config beat -l info
```

### 4. Monitor Celery with Flower (Optional)

```bash
# Install Flower
pip install flower

# Start Flower
celery -A config flower

# Access UI: http://localhost:5555
```

---

## 📬 Notification System

### 1. Notification Models

**Location**: `backend/apps/communications/models.py`

#### Notification Model
```python
class Notification(BaseModel):
    recipient_user = ForeignKey(User)           # Who receives it
    sender_user = ForeignKey(User, null=True)   # Who sent it
    title = CharField(max_length=255)           # Notification title
    message = TextField()                        # Message body
    notification_type = CharField(choices=[
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('ALERT', 'Alert'),
        ('ANNOUNCEMENT', 'Announcement'),
    ])
    priority = CharField(choices=[
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ])
    is_read = BooleanField(default=False)       # Read status
    sent_at = DateTimeField(auto_now_add=True)  # When sent
    read_at = DateTimeField(null=True)          # When read
```

### 2. Create Notification Task

**File**: `backend/apps/communications/tasks.py`

```python
from celery import shared_task
from apps.communications.models import Notification
from apps.authentication.models import User

@shared_task
def send_notification(recipient_id, title, message, notification_type='INFO', priority='MEDIUM'):
    """
    Send in-app notification to a user
    """
    try:
        recipient = User.objects.get(id=recipient_id)

        notification = Notification.objects.create(
            recipient_user=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
        )

        return {
            'status': 'success',
            'notification_id': str(notification.id),
            'message': f'Notification sent to {recipient.email}'
        }
    except User.DoesNotExist:
        return {'status': 'error', 'message': 'User not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def send_bulk_notification(user_ids, title, message, notification_type='INFO'):
    """
    Send notification to multiple users
    """
    success_count = 0
    failed_count = 0

    for user_id in user_ids:
        try:
            result = send_notification.apply_async(
                args=[user_id, title, message, notification_type]
            )
            success_count += 1
        except Exception as e:
            failed_count += 1

    return {
        'status': 'completed',
        'success': success_count,
        'failed': failed_count,
        'total': len(user_ids)
    }
```

### 3. Usage Example

```python
from apps.communications.tasks import send_notification, send_bulk_notification

# Send single notification (async)
send_notification.delay(
    recipient_id='user-uuid-here',
    title='Course Registration Open',
    message='Course registration for Fall 2025 is now open!',
    notification_type='ANNOUNCEMENT',
    priority='HIGH'
)

# Send to all students
from apps.students.models import Student
student_ids = list(Student.objects.values_list('user_id', flat=True))

send_bulk_notification.delay(
    user_ids=student_ids,
    title='Fee Payment Reminder',
    message='Please complete your tuition payment by March 31, 2025.',
    notification_type='WARNING'
)
```

---

## 📱 SMS Integration

### 1. SMS Configuration

**Supported Gateways:**
- Twilio (International)
- Africa's Talking (Africa)

**Environment Variables** (`.env`):
```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Africa's Talking
AFRICAS_TALKING_USERNAME=your_username
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_SHORTCODE=your_shortcode
```

### 2. SMS Task

**File**: `backend/apps/communications/tasks.py`

```python
from celery import shared_task
from twilio.rest import Client
from apps.communications.models import SMSLog

@shared_task
def send_sms(phone_number, message, gateway='twilio'):
    """
    Send SMS via Twilio or Africa's Talking
    """
    try:
        if gateway == 'twilio':
            client = Client(
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN
            )

            result = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number
            )

            # Log SMS
            SMSLog.objects.create(
                recipient_phone=phone_number,
                message=message,
                status='SENT',
                gateway_response={'sid': result.sid, 'status': result.status},
                cost=0.05  # Approximate cost
            )

            return {'status': 'success', 'sid': result.sid}

        elif gateway == 'africastalking':
            import africastalking

            africastalking.initialize(
                settings.AFRICAS_TALKING_USERNAME,
                settings.AFRICAS_TALKING_API_KEY
            )

            sms = africastalking.SMS
            result = sms.send(message, [phone_number])

            SMSLog.objects.create(
                recipient_phone=phone_number,
                message=message,
                status='SENT',
                gateway_response=result,
                cost=0.02
            )

            return {'status': 'success', 'result': result}

    except Exception as e:
        SMSLog.objects.create(
            recipient_phone=phone_number,
            message=message,
            status='FAILED',
            gateway_response={'error': str(e)}
        )
        return {'status': 'error', 'message': str(e)}


@shared_task
def send_admission_sms(student_id):
    """
    Send admission confirmation SMS
    """
    from apps.students.models import Student

    student = Student.objects.get(id=student_id)
    message = f"Congratulations {student.user.first_name}! You have been admitted to {student.program.name}. Student ID: {student.student_id}. Welcome to EBKUST!"

    return send_sms.delay(student.user.phone, message)
```

### 3. SMS Usage Example

```python
from apps.communications.tasks import send_sms, send_admission_sms

# Send single SMS
send_sms.delay(
    phone_number='+23276123456',
    message='Your exam results are now available. Check the portal.',
    gateway='twilio'
)

# Send admission SMS
send_admission_sms.delay(student_id='student-uuid')
```

---

## 📧 Email Integration

### 1. Email Configuration

**Supported Services:**
- SMTP (Gmail, Outlook, etc.)
- SendGrid

**Environment Variables** (`.env`):
```env
# SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@ebkustsl.edu.sl

# SendGrid (Alternative)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 2. Email Task

**File**: `backend/apps/communications/tasks.py`

```python
from celery import shared_task
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from apps.communications.models import EmailLog

@shared_task
def send_email_notification(recipient_email, subject, message, html_content=None):
    """
    Send email notification
    """
    try:
        if html_content:
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
        else:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

        # Log email
        EmailLog.objects.create(
            recipient_email=recipient_email,
            subject=subject,
            body=message,
            status='SENT'
        )

        return {'status': 'success'}

    except Exception as e:
        EmailLog.objects.create(
            recipient_email=recipient_email,
            subject=subject,
            body=message,
            status='FAILED'
        )
        return {'status': 'error', 'message': str(e)}


@shared_task
def send_admission_email(student_id):
    """
    Send formatted admission email
    """
    from apps.students.models import Student

    student = Student.objects.get(id=student_id)

    # HTML content
    html_content = render_to_string('emails/admission_letter.html', {
        'student_name': student.user.get_full_name(),
        'student_id': student.student_id,
        'program': student.program.name,
        'campus': student.campus.name,
        'academic_year': '2024/2025'
    })

    # Plain text content
    plain_message = f"""
Dear {student.user.first_name},

Congratulations! You have been offered admission to {student.program.name}.

Student ID: {student.student_id}
Program: {student.program.name}
Campus: {student.campus.name}

Please login to the student portal to complete your registration.

Welcome to EBKUST!

Regards,
Admissions Office
Ernest Bai Koroma University of Science and Technology
"""

    return send_email_notification.delay(
        recipient_email=student.user.email,
        subject='Admission Offer - EBKUST',
        message=plain_message,
        html_content=html_content
    )
```

### 3. Email Usage Example

```python
from apps.communications.tasks import send_email_notification, send_admission_email

# Send simple email
send_email_notification.delay(
    recipient_email='student@example.com',
    subject='Course Registration Confirmation',
    message='Your course registration has been confirmed.'
)

# Send admission email
send_admission_email.delay(student_id='student-uuid')
```

---

## 📄 Letter Generation

### 1. Letter Generation Task

**File**: `backend/apps/letters/tasks.py`

```python
from celery import shared_task
from apps.letters.models import LetterTemplate, GeneratedLetter
from apps.students.models import Student

@shared_task
def generate_admission_letter(student_id):
    """
    Generate admission letter for student
    """
    try:
        student = Student.objects.get(id=student_id)
        template = LetterTemplate.objects.get(code='ADMISSION_LETTER')

        # Prepare context data
        context = {
            'student_name': student.user.get_full_name(),
            'student_id': student.student_id,
            'program_name': student.program.name,
            'campus_name': student.campus.name,
            'academic_year': '2024/2025',
            'registration_deadline': '2025-09-30',
        }

        # Generate letter content
        content = template.content
        for key, value in context.items():
            content = content.replace(f'{{{{{key}}}}}', str(value))

        # Create generated letter
        letter = GeneratedLetter.objects.create(
            template=template,
            recipient_user=student.user,
            content=content,
            status='DRAFT',
            generated_by=None,  # System generated
        )

        return {
            'status': 'success',
            'letter_id': str(letter.id),
            'message': 'Letter generated successfully'
        }

    except Exception as e:
        return {'status': 'error', 'message': str(e)}


@shared_task
def bulk_generate_admission_letters(student_ids):
    """
    Generate admission letters for multiple students
    """
    results = {
        'success': 0,
        'failed': 0,
        'total': len(student_ids)
    }

    for student_id in student_ids:
        try:
            generate_admission_letter.apply_async(args=[student_id])
            results['success'] += 1
        except Exception:
            results['failed'] += 1

    return results
```

### 2. Letter Usage Example

```python
from apps.letters.tasks import generate_admission_letter, bulk_generate_admission_letters

# Generate single letter
generate_admission_letter.delay(student_id='student-uuid')

# Bulk generate for all admitted students
from apps.students.models import Student
admitted_students = Student.objects.filter(
    enrollment_status='ACTIVE',
    admission_date__year=2025
).values_list('id', flat=True)

bulk_generate_admission_letters.delay(list(admitted_students))
```

---

## 🧪 Testing

### 1. Test RabbitMQ Connection

```python
# Create test file: test_rabbitmq.py
import pika

try:
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('localhost')
    )
    channel = connection.channel()
    print("✓ RabbitMQ connection successful!")
    connection.close()
except Exception as e:
    print(f"✗ RabbitMQ connection failed: {e}")
```

### 2. Test Celery Task

```python
# Django shell
python manage.py shell

from apps.communications.tasks import send_notification

# Send test notification
result = send_notification.delay(
    recipient_id='user-id-here',
    title='Test Notification',
    message='This is a test message from Celery'
)

print(f"Task ID: {result.id}")
print(f"Task State: {result.state}")
```

### 3. Monitor Task Status

```python
# Check task result
from celery.result import AsyncResult

task = AsyncResult('task-id-here')
print(f"Status: {task.status}")
print(f"Result: {task.result}")
```

---

## 🚀 Quick Start Commands

### Start All Services:

```bash
# 1. Start Docker services
docker-compose up -d postgres redis rabbitmq

# 2. Start Django backend
cd backend
python manage.py runserver

# 3. Start Celery worker (new terminal)
cd backend
celery -A config worker -l info --pool=solo

# 4. Start Celery beat (new terminal)
cd backend
celery -A config beat -l info

# 5. Start Next.js frontend (new terminal)
cd frontend
npm run dev
```

### Seed Database:

```bash
cd backend
python manage.py seed_comprehensive --students 200 --lecturers 50
```

### Test Notification System:

```bash
python manage.py shell

from apps.communications.tasks import send_notification
from apps.students.models import Student

student = Student.objects.first()
send_notification.delay(
    recipient_id=str(student.user.id),
    title='System Test',
    message='RabbitMQ and Celery are working!',
    notification_type='INFO',
    priority='HIGH'
)
```

---

## 📊 Monitoring & Debugging

### RabbitMQ Management UI:
- **URL**: http://localhost:15672
- Monitor queues, exchanges, connections
- View message rates and throughput

### Celery Flower Dashboard:
```bash
celery -A config flower
```
- **URL**: http://localhost:5555
- Monitor tasks, workers, and performance

### Check Celery Logs:
```bash
# Worker logs
celery -A config worker -l debug

# Beat scheduler logs
celery -A config beat -l debug
```

### Django Admin:
- View notifications: `/admin/communications/notification/`
- View SMS logs: `/admin/communications/smslog/`
- View email logs: `/admin/communications/emaillog/`

---

## 🔧 Troubleshooting

### Issue: Celery can't connect to RabbitMQ

**Solution:**
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Check connection
telnet localhost 5672

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Issue: Tasks not executing

**Solution:**
```bash
# Ensure worker is running
celery -A config worker -l info

# Check task registration
celery -A config inspect registered

# Purge old tasks
celery -A config purge
```

### Issue: Email not sending

**Solution:**
```env
# Check .env settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Use App Password for Gmail
```

---

## 📚 Additional Resources

- **RabbitMQ Documentation**: https://www.rabbitmq.com/documentation.html
- **Celery Documentation**: https://docs.celeryproject.org/
- **Django Celery Integration**: https://docs.celeryproject.org/en/stable/django/
- **Twilio API**: https://www.twilio.com/docs/sms
- **Africa's Talking**: https://developers.africastalking.com/

---

## ✅ Checklist

- [ ] RabbitMQ running (port 5672)
- [ ] Management UI accessible (port 15672)
- [ ] Redis running (port 6379)
- [ ] Celery worker running
- [ ] Celery beat running
- [ ] Django backend running
- [ ] Database seeded
- [ ] Test notification sent successfully
- [ ] Email configuration verified
- [ ] SMS gateway configured (optional)

---

**Your notification system is now fully configured and ready to use!** 🎉
