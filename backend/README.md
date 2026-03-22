# University LMS Backend

Django REST API backend for the University Learning Management System.

## Project Structure

```
backend/
├── config/                 # Django project configuration
│   ├── settings/          # Modular settings (base, dev, prod, test)
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/                  # Django applications
│   ├── authentication/    # Custom user model, JWT, RBAC
│   ├── campuses/         # Multi-campus management
│   ├── students/         # Student management
│   ├── staff/            # Staff/faculty management
│   ├── courses/          # Course management
│   ├── exams/            # Examination system
│   ├── finance/          # Finance & payments
│   ├── communications/   # SMS/email notifications
│   └── analytics/        # Reporting & analytics
├── core/                 # Core utilities
│   ├── utils/           # Helper functions
│   ├── exceptions/      # Custom exceptions
│   └── middleware/      # Custom middleware
├── manage.py
├── requirements.txt
├── Dockerfile
└── pytest.ini
```

## Tech Stack

- **Framework**: Django 5.0.3, Django REST Framework 3.14.0
- **Database**: PostgreSQL (with psycopg2)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Docs**: drf-spectacular
- **Task Queue**: Celery + Redis
- **Payments**: Stripe, Paystack, Flutterwave
- **Communications**: Twilio, Africa's Talking, SendGrid
- **Testing**: pytest, pytest-django, factory-boy
- **Production**: Gunicorn, WhiteNoise

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis (for Celery)

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file from example:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## Environment Variables

See `.env.example` for all available environment variables.

## Settings

The project uses modular settings:

- `base.py` - Common settings for all environments
- `development.py` - Development-specific settings
- `production.py` - Production-specific settings
- `test.py` - Testing-specific settings

Change settings by setting `DJANGO_SETTINGS_MODULE`:
```bash
export DJANGO_SETTINGS_MODULE=config.settings.production
```

## Running Tests

```bash
pytest
```

With coverage:
```bash
pytest --cov=apps --cov=core --cov-report=html
```

## Docker

Build and run with Docker:

```bash
docker build -t university-lms-backend .
docker run -p 8000:8000 university-lms-backend
```

Or use docker-compose from the root directory:
```bash
docker-compose up backend
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/

## Next Steps

1. Implement custom User model in `apps/authentication/`
2. Create models for each app
3. Create serializers and viewsets
4. Add API endpoints
5. Write tests
6. Configure RBAC permissions
7. Set up Celery tasks
8. Integrate payment gateways
9. Set up communication services

## License

Proprietary - University LMS
