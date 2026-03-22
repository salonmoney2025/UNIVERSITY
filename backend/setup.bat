@echo off
REM Quick setup script for University LMS Backend (Windows)

echo Setting up University LMS Backend...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copy .env.example to .env
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update .env with your configuration!
)

REM Run migrations
echo Running migrations...
python manage.py migrate

REM Create superuser
echo Creating superuser...
python manage.py createsuperuser

echo Setup complete! Run 'python manage.py runserver' to start the development server.
pause
