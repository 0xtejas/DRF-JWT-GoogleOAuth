from django.contrib import admin
from .models import CustomUser, JWTToken

admin.site.register(CustomUser)
admin.site.register(JWTToken)
