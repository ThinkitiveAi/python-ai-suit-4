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

from customehr.users.models import User
from customehr.users.models import ClinicianUser
from customehr.users.models import Patient

from .serializers import UserSerializer
from .serializers import ClinicianUserSerializer
from .serializers import PatientSerializer
from .serializers import LoginSerializer

class IsProviderOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['provider', 'staff']

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'staff'

class IsPatientOrProviderOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['patient', 'provider', 'staff']

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
        if user.user_type == 'staff':
            return Patient.objects.all()
        elif user.user_type == 'provider':
            return Patient.objects.all()
        elif user.user_type == 'patient' and user.linked_patient:
            return Patient.objects.filter(id=user.linked_patient.id)
        return Patient.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaff()]
        return super().get_permissions()
