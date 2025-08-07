from allauth.account.decorators import secure_admin_login
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.utils.translation import gettext_lazy as _

from .forms import UserAdminChangeForm
from .forms import UserAdminCreationForm
from .models import User, ClinicianUser, Patient

if settings.DJANGO_ADMIN_FORCE_ALLAUTH:
    # Force the `admin` sign in process to go through the `django-allauth` workflow:
    # https://docs.allauth.org/en/latest/common/admin.html#admin
    admin.autodiscover()
    admin.site.login = secure_admin_login(admin.site.login)  # type: ignore[method-assign]


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("name", "user_type")}),
        (_("Linked Accounts"), {"fields": ("linked_patient", "linked_clinician")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    list_display = ["email", "name", "user_type", "is_superuser"]
    search_fields = ["name"]
    ordering = ["id"]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "user_type", "linked_patient", "linked_clinician"),
            },
        ),
    )


@admin.register(ClinicianUser)
class ClinicianUserAdmin(admin.ModelAdmin):
    list_display = ["firstname", "lastname", "role", "emailid", "contactnumber", "supervising_clinician"]
    list_filter = ["role", "supervising_clinician"]
    search_fields = ["firstname", "lastname", "emailid"]
    ordering = ["firstname", "lastname"]
    fieldsets = (
        (None, {"fields": ("firstname", "lastname", "emailid")}),
        (_("Professional Info"), {"fields": ("role", "contactnumber", "npi")}),
        (_("Location & Language"), {"fields": ("location", "language")}),
        (_("Supervision"), {"fields": ("supervising_clinician",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("firstname", "lastname", "role", "emailid", "contactnumber", "npi", "location", "language", "supervising_clinician"),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        # Create User account if it doesn't exist
        if not hasattr(obj, 'user_account'):
            user_data = {
                'name': f"{obj.firstname} {obj.lastname}",
                'email': obj.emailid,
                'password': 'defaultpassword123',
                'user_type': 'provider',
                'linked_clinician': obj,
                'contactnumber': obj.contactnumber,
                'role': obj.role,
                'status': True
            }
            
            User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                name=user_data['name'],
                user_type=user_data['user_type'],
                linked_clinician=user_data['linked_clinician'],
                contactnumber=user_data['contactnumber'],
                role=user_data['role'],
                status=user_data['status']
            )


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "date_of_birth", "sex", "phone_number", "city", "state"]
    list_filter = ["sex", "gender_identity", "ethnicity", "race", "state"]
    search_fields = ["first_name", "last_name", "preferred_name", "email", "phone_number"]
    ordering = ["last_name", "first_name"]
    fieldsets = (
        (_("Personal Information"), {"fields": ("first_name", "middle_name", "last_name", "preferred_name", "date_of_birth")}),
        (_("Demographics"), {"fields": ("sex", "gender_identity", "ethnicity", "race", "language")}),
        (_("Contact Information"), {"fields": ("email", "phone_number")}),
        (_("Address"), {"fields": ("address_line1", "address_line2", "city", "state", "zip_code")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("first_name", "middle_name", "last_name", "preferred_name", "date_of_birth", "sex", "gender_identity", "email", "phone_number", "ethnicity", "race", "language", "address_line1", "address_line2", "city", "state", "zip_code"),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        # Create User account if it doesn't exist
        if not hasattr(obj, 'user_account'):
            user_data = {
                'name': f"{obj.first_name} {obj.last_name}",
                'email': obj.email or f"patient_{obj.id}@example.com",
                'password': 'defaultpassword123',
                'user_type': 'patient',
                'linked_patient': obj,
                'contactnumber': obj.phone_number,
                'role': 'patient',
                'status': True
            }
            
            User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                name=user_data['name'],
                user_type=user_data['user_type'],
                linked_patient=user_data['linked_patient'],
                contactnumber=user_data['contactnumber'],
                role=user_data['role'],
                status=user_data['status']
            )
