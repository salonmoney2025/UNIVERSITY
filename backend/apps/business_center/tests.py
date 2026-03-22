"""
Business Center Tests
"""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import PinBatch, ApplicationPin, Receipt
from apps.campuses.models import Campus

User = get_user_model()


class PinBatchTests(APITestCase):
    """Tests for Pin Batch model and API"""

    def setUp(self):
        # Create campus
        self.campus = Campus.objects.create(
            name='Main Campus',
            code='MAIN',
            address='Test Address'
        )

        # Create business center user
        self.business_user = User.objects.create_user(
            email='business@test.com',
            password='test123',
            role='BUSINESS_CENTER',
            campus=self.campus
        )
        self.client.force_authenticate(user=self.business_user)

    def test_create_pin_batch(self):
        """Test creating a pin batch"""
        data = {
            'pin_type': 'APPLICATION',
            'quantity': 100,
            'price_per_pin': 50.00,
            'valid_from': timezone.now().isoformat(),
            'valid_until': (timezone.now() + timedelta(days=90)).isoformat(),
            'campus': str(self.campus.id),
            'description': 'Test batch'
        }
        response = self.client.post('/api/business-center/pin-batches/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PinBatch.objects.count(), 1)

    def test_pin_generation(self):
        """Test that pins are generated when batch is created"""
        batch = PinBatch.objects.create(
            pin_type='APPLICATION',
            quantity=10,
            price_per_pin=50.00,
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=90),
            campus=self.campus,
            created_by=self.business_user
        )

        # Pins should be generated via signal/save
        # Note: This would work after implementing the pin generation in save/signal
        pass


class ApplicationPinTests(APITestCase):
    """Tests for Application Pin model and API"""

    def setUp(self):
        self.campus = Campus.objects.create(
            name='Main Campus',
            code='MAIN',
            address='Test Address'
        )

        self.business_user = User.objects.create_user(
            email='business@test.com',
            password='test123',
            role='BUSINESS_CENTER',
            campus=self.campus
        )

        # Create a batch
        self.batch = PinBatch.objects.create(
            pin_type='APPLICATION',
            quantity=10,
            price_per_pin=50.00,
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=90),
            campus=self.campus,
            created_by=self.business_user
        )

    def test_pin_verification(self):
        """Test pin verification"""
        # Create a pin
        pin = ApplicationPin.objects.create(
            batch=self.batch,
            pin_number='123456789012',
            serial_number='ABC123DEF456',
            valid_until=self.batch.valid_until
        )

        data = {
            'pin_number': pin.pin_number,
            'serial_number': pin.serial_number
        }
        response = self.client.post('/api/business-center/pins/verify/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])


class ReceiptTests(APITestCase):
    """Tests for Receipt model and API"""

    def setUp(self):
        self.campus = Campus.objects.create(
            name='Main Campus',
            code='MAIN',
            address='Test Address'
        )

        self.finance_user = User.objects.create_user(
            email='finance@test.com',
            password='test123',
            role='FINANCE',
            campus=self.campus
        )
        self.client.force_authenticate(user=self.finance_user)

    def test_create_receipt(self):
        """Test creating a receipt"""
        data = {
            'receipt_type': 'PIN_PURCHASE',
            'payer_name': 'John Doe',
            'payer_email': 'john@test.com',
            'description': 'Purchase of application pin',
            'amount': 50.00,
            'payment_method': 'CASH',
            'payment_date': timezone.now().isoformat(),
            'campus': str(self.campus.id)
        }
        response = self.client.post('/api/business-center/receipts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Receipt.objects.count(), 1)
