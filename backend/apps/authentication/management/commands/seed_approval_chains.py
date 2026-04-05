"""
Management command to seed default approval chains
"""
from django.core.management.base import BaseCommand
from apps.authentication.approval_models import ApprovalChain, ApprovalLevel
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Seed default approval chains for the system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seeding approval chains...'))

        # 1. Grade Change Approval
        grade_chain, created = ApprovalChain.objects.get_or_create(
            code='GRADE_CHANGE',
            defaults={
                'name': 'Grade Change Approval',
                'description': 'Approval workflow for changing student grades',
                'permission_required': 'APPROVE_GRADES',
                'escalation_hours': 48,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Lecturer submits
            ApprovalLevel.objects.create(
                approval_chain=grade_chain,
                level_number=1,
                role=User.HEAD_OF_DEPARTMENT,
                require_all_approvers=False
            )

            # Level 2: Dean approves
            ApprovalLevel.objects.create(
                approval_chain=grade_chain,
                level_number=2,
                role=User.DEAN,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {grade_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {grade_chain.name}'))

        # 2. Fee Waiver Approval
        fee_waiver_chain, created = ApprovalChain.objects.get_or_create(
            code='FEE_WAIVER',
            defaults={
                'name': 'Fee Waiver Approval',
                'description': 'Approval workflow for student fee waivers',
                'permission_required': 'MANAGE_FEES',
                'escalation_hours': 72,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Dean recommends
            ApprovalLevel.objects.create(
                approval_chain=fee_waiver_chain,
                level_number=1,
                role=User.DEAN,
                require_all_approvers=False
            )

            # Level 2: Finance verifies
            ApprovalLevel.objects.create(
                approval_chain=fee_waiver_chain,
                level_number=2,
                role=User.FINANCE,
                require_all_approvers=False
            )

            # Level 3: Chancellor approves
            ApprovalLevel.objects.create(
                approval_chain=fee_waiver_chain,
                level_number=3,
                role=User.CHANCELLOR,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {fee_waiver_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {fee_waiver_chain.name}'))

        # 3. Document Signing Approval
        doc_signing_chain, created = ApprovalChain.objects.get_or_create(
            code='DOCUMENT_SIGNING',
            defaults={
                'name': 'Document Signing Approval',
                'description': 'Approval workflow for signing official documents',
                'permission_required': 'SIGN_LETTERS',
                'escalation_hours': 24,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Registry verifies
            ApprovalLevel.objects.create(
                approval_chain=doc_signing_chain,
                level_number=1,
                role=User.REGISTRY_ADMIN,
                require_all_approvers=False
            )

            # Level 2: Registrar signs
            ApprovalLevel.objects.create(
                approval_chain=doc_signing_chain,
                level_number=2,
                role=User.SUPER_ADMIN,  # Typically the Registrar
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {doc_signing_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {doc_signing_chain.name}'))

        # 4. Refund Processing
        refund_chain, created = ApprovalChain.objects.get_or_create(
            code='REFUND_PROCESSING',
            defaults={
                'name': 'Refund Processing Approval',
                'description': 'Approval workflow for processing payment refunds',
                'permission_required': 'PROCESS_REFUND',
                'escalation_hours': 48,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Finance staff verifies
            ApprovalLevel.objects.create(
                approval_chain=refund_chain,
                level_number=1,
                role=User.FINANCE_STAFF,
                require_all_approvers=False
            )

            # Level 2: Finance head approves
            ApprovalLevel.objects.create(
                approval_chain=refund_chain,
                level_number=2,
                role=User.FINANCE,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {refund_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {refund_chain.name}'))

        # 5. Student Record Changes
        record_change_chain, created = ApprovalChain.objects.get_or_create(
            code='STUDENT_RECORD_CHANGE',
            defaults={
                'name': 'Student Record Change Approval',
                'description': 'Approval workflow for editing student records',
                'permission_required': 'EDIT_STUDENT_RECORDS',
                'escalation_hours': 24,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Registry staff verifies
            ApprovalLevel.objects.create(
                approval_chain=record_change_chain,
                level_number=1,
                role=User.REGISTRY,
                require_all_approvers=False
            )

            # Level 2: Registry admin approves
            ApprovalLevel.objects.create(
                approval_chain=record_change_chain,
                level_number=2,
                role=User.REGISTRY_ADMIN,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {record_change_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {record_change_chain.name}'))

        # 6. Exam Result Publication
        exam_publish_chain, created = ApprovalChain.objects.get_or_create(
            code='EXAM_RESULT_PUBLICATION',
            defaults={
                'name': 'Exam Result Publication Approval',
                'description': 'Approval workflow for publishing exam results',
                'permission_required': 'PUBLISH_RESULTS',
                'escalation_hours': 12,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Faculty Exam Officer verifies
            ApprovalLevel.objects.create(
                approval_chain=exam_publish_chain,
                level_number=1,
                role=User.FACULTY_EXAM,
                require_all_approvers=False
            )

            # Level 2: Dean approves
            ApprovalLevel.objects.create(
                approval_chain=exam_publish_chain,
                level_number=2,
                role=User.DEAN,
                require_all_approvers=False
            )

            # Level 3: Registry Academic publishes
            ApprovalLevel.objects.create(
                approval_chain=exam_publish_chain,
                level_number=3,
                role=User.REGISTRY_ACADEMIC,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {exam_publish_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {exam_publish_chain.name}'))

        # 7. Course Registration Override
        course_override_chain, created = ApprovalChain.objects.get_or_create(
            code='COURSE_REGISTRATION_OVERRIDE',
            defaults={
                'name': 'Course Registration Override',
                'description': 'Approval for late or prerequisite-override registration',
                'permission_required': 'MANAGE_COURSES',
                'escalation_hours': 24,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Lecturer approves
            ApprovalLevel.objects.create(
                approval_chain=course_override_chain,
                level_number=1,
                role=User.LECTURER,
                require_all_approvers=False
            )

            # Level 2: Head of Department approves
            ApprovalLevel.objects.create(
                approval_chain=course_override_chain,
                level_number=2,
                role=User.HEAD_OF_DEPARTMENT,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {course_override_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {course_override_chain.name}'))

        # 8. Graduation Clearance
        graduation_chain, created = ApprovalChain.objects.get_or_create(
            code='GRADUATION_CLEARANCE',
            defaults={
                'name': 'Graduation Clearance Approval',
                'description': 'Multi-department clearance for graduation',
                'permission_required': 'MANAGE_GRADUATION',
                'escalation_hours': 72,
                'notify_on_submission': True,
                'notify_on_approval': True,
                'notify_on_rejection': True
            }
        )

        if created:
            # Level 1: Finance clears fees
            ApprovalLevel.objects.create(
                approval_chain=graduation_chain,
                level_number=1,
                role=User.FINANCE,
                require_all_approvers=False
            )

            # Level 2: Library clearance
            ApprovalLevel.objects.create(
                approval_chain=graduation_chain,
                level_number=2,
                role=User.LIBRARY,
                require_all_approvers=False
            )

            # Level 3: Dean approves academic standing
            ApprovalLevel.objects.create(
                approval_chain=graduation_chain,
                level_number=3,
                role=User.DEAN,
                require_all_approvers=False
            )

            # Level 4: Registry finalizes
            ApprovalLevel.objects.create(
                approval_chain=graduation_chain,
                level_number=4,
                role=User.REGISTRY_ACADEMIC,
                require_all_approvers=False
            )

            self.stdout.write(self.style.SUCCESS(f'[+] Created: {graduation_chain.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'[=] Exists: {graduation_chain.name}'))

        # Summary
        total_chains = ApprovalChain.objects.count()
        total_levels = ApprovalLevel.objects.count()

        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Approval Chains Seeded Successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Total Chains: {total_chains}'))
        self.stdout.write(self.style.SUCCESS(f'Total Levels: {total_levels}'))
        self.stdout.write(self.style.SUCCESS('='*50 + '\n'))
