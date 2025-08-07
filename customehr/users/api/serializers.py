from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken

from customehr.users.models import User
from customehr.users.models import ClinicianUser
from customehr.users.models import Patient


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            "name", "email", "password", "url",
            "contactnumber", "role", "status", "user_type",
            "linked_patient", "linked_clinician"
        ]
        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class ClinicianUserSerializer(serializers.ModelSerializer):
    default_password = serializers.CharField(read_only=True)

    class Meta:
        model = ClinicianUser
        fields = [
            "id", "firstname", "lastname", "role", "emailid", "contactnumber",
            "npi", "location", "language", "supervising_clinician", "default_password"
        ]

    def create(self, validated_data):
        # Create the clinician user first
        clinician = ClinicianUser.objects.create(**validated_data)
        
        # Create a User account for this clinician
        user_data = {
            'name': f"{clinician.firstname} {clinician.lastname}",
            'email': clinician.emailid,
            'password': 'defaultpassword123',  # Default password
            'user_type': 'provider',
            'linked_clinician': clinician,
            'contactnumber': clinician.contactnumber,
            'role': clinician.role,
            'status': True
        }
        
        # Create the user account
        user = User.objects.create_user(
            email=user_data['email'],
            password=user_data['password'],
            name=user_data['name'],
            user_type=user_data['user_type'],
            linked_clinician=user_data['linked_clinician'],
            contactnumber=user_data['contactnumber'],
            role=user_data['role'],
            status=user_data['status']
        )
        
        # Add password to the response data
        clinician.default_password = user_data['password']
        return clinician


class PatientSerializer(serializers.ModelSerializer):
    default_password = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id", "first_name", "middle_name", "last_name", "preferred_name",
            "date_of_birth", "sex", "gender_identity", "email", "phone_number",
            "ethnicity", "race", "language", "address_line1", "address_line2",
            "city", "state", "zip_code", "default_password"
        ]

    def create(self, validated_data):
        # Create the patient first
        patient = Patient.objects.create(**validated_data)
        
        # Create a User account for this patient
        user_data = {
            'name': f"{patient.first_name} {patient.last_name}",
            'email': patient.email or f"patient_{patient.id}@example.com",  # Generate email if not provided
            'password': 'defaultpassword123',  # Default password
            'user_type': 'patient',
            'linked_patient': patient,
            'contactnumber': patient.phone_number,
            'role': 'patient',
            'status': True
        }
        
        # Create the user account
        user = User.objects.create_user(
            email=user_data['email'],
            password=user_data['password'],
            name=user_data['name'],
            user_type=user_data['user_type'],
            linked_patient=user_data['linked_patient'],
            contactnumber=user_data['contactnumber'],
            role=user_data['role'],
            status=user_data['status']
        )
        
        # Add password to the response data
        patient.default_password = user_data['password']
        return patient


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            refresh = RefreshToken.for_user(user)
            update_last_login(None, user)
            
            attrs['user'] = user
            attrs['refresh'] = str(refresh)
            attrs['access'] = str(refresh.access_token)
            attrs['user_type'] = user.user_type
            return attrs
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
