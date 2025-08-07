
from typing import ClassVar

from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.db.models import EmailField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """
    Default custom user model for customehr.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]
    email = EmailField(_("email address"), unique=True)
    username = None  # type: ignore[assignment]

    contactnumber = CharField(_("Contact Number"), blank=True, max_length=20)
    ROLE_CHOICES = [
        ("nurse", "Nurse"),
        ("billing_staff", "Billing Staff"),
    ]
    role = CharField(_("Role"), max_length=20, choices=ROLE_CHOICES, blank=True)
    status = models.BooleanField(_("Status"), default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    USER_TYPE_CHOICES = [
        ("staff", "Staff"),
        ("provider", "Provider"),
        ("patient", "Patient"),
    ]
    user_type = models.CharField("User Type", max_length=10, choices=USER_TYPE_CHOICES, default="staff")
    linked_patient = models.ForeignKey("Patient", on_delete=models.CASCADE, null=True, blank=True, related_name="user_account")
    linked_clinician = models.ForeignKey("ClinicianUser", on_delete=models.CASCADE, null=True, blank=True, related_name="user_account")

    objects: ClassVar[UserManager] = UserManager()

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"pk": self.id})
    
    def __str__(self):
        return self.name


class ClinicianUser(models.Model):
    ROLE_CHOICES = [
        ("physicians", "Physicians"),
        ("nurses", "Nurses"),
        ("surgical_assistants", "Surgical Assistants"),
    ]
    SUPERVISING_CLINICIAN_CHOICES = [
        ("none", "None"),
        ("senior", "Senior Clinician"),
        ("chief", "Chief Clinician"),
    ]

    firstname = models.CharField("First Name", max_length=255)
    lastname = models.CharField("Last Name", max_length=255)
    role = models.CharField("Role", max_length=30, choices=ROLE_CHOICES)
    emailid = models.EmailField("Email Address", unique=True)
    contactnumber = models.CharField("Contact Number", max_length=20)
    npi = models.CharField("NPI", max_length=20, blank=True)
    location = models.CharField("Location", max_length=255, blank=True)
    language = models.CharField("Language", max_length=50, blank=True)
    supervising_clinician = models.CharField("Supervising Clinician", max_length=20, choices=SUPERVISING_CLINICIAN_CHOICES, default="none")

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.emailid})"


class Patient(models.Model):
    SEX_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
        ("unknown", "Unknown"),
    ]
    GENDER_IDENTITY_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("transgender_male", "Transgender Male"),
        ("transgender_female", "Transgender Female"),
        ("non_binary", "Non-binary"),
        ("gender_fluid", "Gender Fluid"),
        ("other", "Other"),
        ("prefer_not_to_say", "Prefer not to say"),
    ]

    first_name = models.CharField("First Name", max_length=255)
    middle_name = models.CharField("Middle Name", max_length=255, blank=True)
    last_name = models.CharField("Last Name", max_length=255)
    preferred_name = models.CharField("Preferred Name", max_length=255, blank=True)
    date_of_birth = models.DateField("Date of Birth")
    sex = models.CharField("Sex", max_length=10, choices=SEX_CHOICES)
    gender_identity = models.CharField("Gender Identity", max_length=20, choices=GENDER_IDENTITY_CHOICES)
    email = models.EmailField("Email Address", blank=True)
    phone_number = models.CharField("Phone Number", max_length=20)
    ethnicity = models.CharField("Ethnicity", max_length=100, blank=True)
    race = models.CharField("Race", max_length=100, blank=True)
    language = models.CharField("Language", max_length=50, blank=True)
    address_line1 = models.CharField("Address Line 1", max_length=255)
    address_line2 = models.CharField("Address Line 2", max_length=255, blank=True)
    city = models.CharField("City", max_length=100)
    state = models.CharField("State", max_length=50)
    zip_code = models.CharField("Zip Code", max_length=10)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.date_of_birth})"
