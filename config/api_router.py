from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter
from django.urls import path

from customehr.users.api.views import UserViewSet, ClinicianUserViewSet, PatientViewSet
from customehr.users.api.views import AppointmentSlotViewSet
from customehr.users.api.views import AppointmentViewSet
from customehr.users.api.views import LoginView

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)
router.register("clinician-users", ClinicianUserViewSet)
router.register("patients", PatientViewSet)
router.register("appointment-slots", AppointmentSlotViewSet)
router.register("appointments", AppointmentViewSet)


app_name = "api"
urlpatterns = router.urls + [
    path("login/", LoginView.as_view(), name="login"),
]
