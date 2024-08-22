from django.urls import path

from app import views

urlpatterns = [
    path("", views.index),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("create/", views.create, name="create"),
    path("update/", views.update, name="update"),
    path("delete/", views.delete, name="delete"),
]
