from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.mixins import UpdateModelMixin
from rest_framework.mixins import CreateModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.permissions import BasePermission
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from django.utils import timezone

from customehr.users.models import User
from customehr.users.models import ClinicianUser
from customehr.users.models import Patient
from customehr.users.models import AppointmentSlot
from customehr.users.models import Appointment

from .serializers import UserSerializer
from .serializers import ClinicianUserSerializer
from .serializers import PatientSerializer
from .serializers import AppointmentSlotSerializer
from .serializers import AppointmentSerializer
from .serializers import LoginSerializer

class IsProviderOrStaff(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'user_type') and request.user.user_type in ['provider', 'staff']

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'user_type') and request.user.user_type == 'staff'

class IsPatientOrProviderOrStaff(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'user_type') and request.user.user_type in ['patient', 'provider', 'staff']

@extend_schema(tags=["Appointment Slots"])
class AppointmentSlotViewSet(viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.all()
    serializer_class = AppointmentSlotSerializer
    permission_classes = [IsProviderOrStaff]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AppointmentSlot.objects.none()
        if hasattr(user, 'user_type') and user.user_type == 'staff':
            return AppointmentSlot.objects.all()
        elif hasattr(user, 'user_type') and user.user_type == 'provider' and hasattr(user, 'linked_clinician') and user.linked_clinician:
            return AppointmentSlot.objects.filter(provider=user.linked_clinician)
        return AppointmentSlot.objects.none()

    def perform_create(self, serializer):
        # If provider is creating, automatically set the provider to themselves
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'provider' and 
            hasattr(self.request.user, 'linked_clinician') and 
            self.request.user.linked_clinician):
            serializer.save(provider=self.request.user.linked_clinician)
        else:
            serializer.save()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Check if user is authenticated first
            if not self.request.user.is_authenticated:
                return [IsProviderOrStaff()]
            # Only staff can create/update/delete slots for other providers
            if hasattr(self.request.user, 'user_type') and self.request.user.user_type == 'provider':
                # Providers can only manage their own slots
                return [IsProviderOrStaff()]
            return [IsStaff()]
        return super().get_permissions()

@extend_schema(
    tags=["Authentication"],
    summary="User Login",
    description="Authenticate user and return JWT tokens. All user types (staff, provider, patient) use this endpoint.",
    request=LoginSerializer,
    responses={
        200: {
            "type": "object",
            "properties": {
                "user": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer"},
                        "name": {"type": "string"},
                        "email": {"type": "string"},
                        "user_type": {"type": "string", "enum": ["staff", "provider", "patient"]},
                        "contactnumber": {"type": "string"},
                        "role": {"type": "string"},
                        "status": {"type": "boolean"},
                        "linked_patient": {"type": "integer", "nullable": True},
                        "linked_clinician": {"type": "integer", "nullable": True},
                        "url": {"type": "string"},
                    }
                },
                "refresh": {"type": "string", "description": "JWT refresh token"},
                "access": {"type": "string", "description": "JWT access token"},
                "user_type": {"type": "string", "enum": ["staff", "provider", "patient"]},
            }
        },
        400: {
            "type": "object",
            "properties": {
                "email": {"type": "array", "items": {"type": "string"}},
                "password": {"type": "array", "items": {"type": "string"}},
                "non_field_errors": {"type": "array", "items": {"type": "string"}},
            }
        }
    },
    examples=[
        OpenApiExample(
            "Patient Login",
            value={
                "email": "patient@example.com",
                "password": "password123"
            },
            request_only=True,
        ),
        OpenApiExample(
            "Provider Login",
            value={
                "email": "doctor@example.com",
                "password": "password123"
            },
            request_only=True,
        ),
        OpenApiExample(
            "Staff Login",
            value={
                "email": "admin@example.com",
                "password": "password123"
            },
            request_only=True,
        ),
        OpenApiExample(
            "Successful Login Response",
            value={
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "patient@example.com",
                    "user_type": "patient",
                    "contactnumber": "+1234567890",
                    "role": "patient",
                    "status": True,
                    "linked_patient": 1,
                    "linked_clinician": None,
                    "url": "http://localhost:8000/api/users/1/"
                },
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "user_type": "patient"
            },
            response_only=True,
        ),
    ]
)
class LoginView(APIView):
    permission_classes = []  # Public API - no authentication required

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                'user': UserSerializer(serializer.validated_data['user'], context={'request': request}).data,
                'refresh': serializer.validated_data['refresh'],
                'access': serializer.validated_data['access'],
                'user_type': serializer.validated_data['user_type'],
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=["User Management"])
class UserViewSet(CreateModelMixin, RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = "pk"
    permission_classes = [IsStaff]

    def get_queryset(self, *args, **kwargs):
        return self.queryset

    @action(detail=False)
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


@extend_schema(tags=["Clinician Management"])
class ClinicianUserViewSet(viewsets.ModelViewSet):
    queryset = ClinicianUser.objects.all()
    serializer_class = ClinicianUserSerializer
    permission_classes = [IsStaff]


@extend_schema(tags=["Patient Management"])
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsPatientOrProviderOrStaff]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Patient.objects.none()
        if hasattr(user, 'user_type') and user.user_type == 'staff':
            return Patient.objects.all()
        elif hasattr(user, 'user_type') and user.user_type == 'provider':
            return Patient.objects.all()
        elif (hasattr(user, 'user_type') and 
              user.user_type == 'patient' and 
              hasattr(user, 'linked_patient') and 
              user.linked_patient):
            return Patient.objects.filter(id=user.linked_patient.id)
        return Patient.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaff()]
        return super().get_permissions()

@extend_schema(tags=["Appointment Booking"])
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsProviderOrStaff]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Appointment.objects.none()
        
        if hasattr(user, 'user_type') and user.user_type == 'staff':
            return Appointment.objects.all()
        elif hasattr(user, 'user_type') and user.user_type == 'provider' and hasattr(user, 'linked_clinician') and user.linked_clinician:
            return Appointment.objects.filter(provider=user.linked_clinician)
        elif hasattr(user, 'user_type') and user.user_type == 'patient' and hasattr(user, 'linked_patient') and user.linked_patient:
            return Appointment.objects.filter(patient=user.linked_patient)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        # If provider is creating, automatically set the provider to themselves
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'provider' and 
            hasattr(self.request.user, 'linked_clinician') and 
            self.request.user.linked_clinician):
            serializer.save(provider=self.request.user.linked_clinician)
        else:
            serializer.save()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Check if user is authenticated first
            if not self.request.user.is_authenticated:
                return [IsProviderOrStaff()]
            # Staff can manage all appointments
            if hasattr(self.request.user, 'user_type') and self.request.user.user_type == 'staff':
                return [IsStaff()]
            # Providers can manage their own appointments
            if hasattr(self.request.user, 'user_type') and self.request.user.user_type == 'provider':
                return [IsProviderOrStaff()]
            # Patients can only view their own appointments
            return [IsPatientOrProviderOrStaff()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def my_appointments(self, request):
        """Get appointments for the current user based on their role."""
        user = request.user
        if hasattr(user, 'user_type') and user.user_type == 'patient' and hasattr(user, 'linked_patient') and user.linked_patient:
            appointments = Appointment.objects.filter(patient=user.linked_patient)
        elif hasattr(user, 'user_type') and user.user_type == 'provider' and hasattr(user, 'linked_clinician') and user.linked_clinician:
            appointments = Appointment.objects.filter(provider=user.linked_clinician)
        else:
            appointments = Appointment.objects.none()
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available appointment slots for a specific provider."""
        provider_id = request.query_params.get('provider_id')
        if not provider_id:
            return Response({"error": "provider_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            provider = ClinicianUser.objects.get(id=provider_id)
            available_slots = AppointmentSlot.objects.filter(
                provider=provider,
                is_available=True,
                dateandtime__gte=timezone.now()
            ).order_by('dateandtime')
            
            from .serializers import AppointmentSlotSerializer
            slot_serializer = AppointmentSlotSerializer(available_slots, many=True)
            return Response(slot_serializer.data)
        except ClinicianUser.DoesNotExist:
            return Response({"error": "Provider not found"}, status=status.HTTP_404_NOT_FOUND)
