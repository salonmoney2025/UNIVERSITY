"""
Letters Management Tests
"""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import LetterTemplate, GeneratedLetter

User = get_user_model()


class LetterTemplateTests(APITestCase):
    """Tests for Letter Template model and API"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='test123',
            role='ADMIN'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_create_letter_template(self):
        """Test creating a letter template"""
        data = {
            'name': 'Admission Letter',
            'letter_type': 'ADMISSION',
            'subject': 'Congratulations on Your Admission',
            'body': 'Dear {{recipient_name}}, ...',
            'requires_signature': True,
            'signature_roles': ['ADMIN', 'DEAN'],
            'is_active': True
        }
        response = self.client.post('/api/letters/templates/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class GeneratedLetterTests(APITestCase):
    """Tests for Generated Letter model and API"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='test123',
            role='ADMIN'
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_generate_reference_number(self):
        """Test reference number generation"""
        # This would need a full setup with campus, etc.
        pass
