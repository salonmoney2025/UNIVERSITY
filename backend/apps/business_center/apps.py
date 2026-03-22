from django.apps import AppConfig


class BusinessCenterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.business_center'
    verbose_name = 'Business Center'

    def ready(self):
        import apps.business_center.signals
