
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


class AppointmentSlot(models.Model):
    DAY_CHOICES = [
        ("monday", "Monday"),
        ("tuesday", "Tuesday"),
        ("wednesday", "Wednesday"),
        ("thursday", "Thursday"),
        ("friday", "Friday"),
        ("saturday", "Saturday"),
        ("sunday", "Sunday"),
    ]

    provider = models.ForeignKey(ClinicianUser, on_delete=models.CASCADE, related_name="appointment_slots")
    timezone = models.CharField("Timezone", max_length=50, default="UTC")
    dateandtime = models.DateTimeField("Date and Time")
    day = models.CharField("Day", max_length=10, choices=DAY_CHOICES)
    is_available = models.BooleanField("Available", default=True)
    created_at = models.DateTimeField("Created At", auto_now_add=True)
    updated_at = models.DateTimeField("Updated At", auto_now=True)

    class Meta:
        ordering = ['dateandtime']
        unique_together = ['provider', 'dateandtime']

    def __str__(self):
        return f"{self.provider.firstname} {self.provider.lastname} - {self.dateandtime.strftime('%Y-%m-%d %H:%M')} ({self.day})"

    def save(self, *args, **kwargs):
        # Auto-populate day from dateandtime if not provided
        if not self.day and self.dateandtime:
            self.day = self.dateandtime.strftime('%A').lower()
        super().save(*args, **kwargs)


class Appointment(models.Model):
    APPOINTMENT_MODE_CHOICES = [
        ("in_person", "In Person"),
        ("virtual", "Virtual"),
        ("phone", "Phone"),
    ]
    
    APPOINTMENT_TYPE_CHOICES = [
        ("consultation", "Consultation"),
        ("follow_up", "Follow Up"),
        ("emergency", "Emergency"),
        ("routine_checkup", "Routine Checkup"),
        ("specialist_visit", "Specialist Visit"),
        ("procedure", "Procedure"),
    ]
    
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("confirmed", "Confirmed"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("no_show", "No Show"),
        ("rescheduled", "Rescheduled"),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    provider = models.ForeignKey(ClinicianUser, on_delete=models.CASCADE, related_name="appointments")
    appointment_slot = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE, related_name="bookings", null=True, blank=True)
    appointment_mode = models.CharField("Appointment Mode", max_length=20, choices=APPOINTMENT_MODE_CHOICES)
    appointment_type = models.CharField("Appointment Type", max_length=20, choices=APPOINTMENT_TYPE_CHOICES)
    estimated_amount = models.DecimalField("Estimated Amount", max_digits=10, decimal_places=2, null=True, blank=True)
    dateandtime = models.DateTimeField("Date and Time")
    reason_for_visit = models.TextField("Reason for Visit")
    status = models.CharField("Status", max_length=20, choices=STATUS_CHOICES, default="scheduled")
    notes = models.TextField("Notes", blank=True)
    created_at = models.DateTimeField("Created At", auto_now_add=True)
    updated_at = models.DateTimeField("Updated At", auto_now=True)

    class Meta:
        ordering = ['dateandtime']
        unique_together = ['patient', 'provider', 'dateandtime']

    def __str__(self):
        return f"{self.patient.first_name} {self.patient.last_name} - {self.provider.firstname} {self.provider.lastname} - {self.dateandtime.strftime('%Y-%m-%d %H:%M')}"

    def save(self, *args, **kwargs):
        # If appointment_slot is provided, update the slot availability
        if self.appointment_slot:
            self.appointment_slot.is_available = False
            self.appointment_slot.save()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # If appointment_slot exists, make it available again
        if self.appointment_slot:
            self.appointment_slot.is_available = True
            self.appointment_slot.save()
        super().delete(*args, **kwargs)
