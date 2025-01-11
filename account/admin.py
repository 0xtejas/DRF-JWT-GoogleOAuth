from django.contrib import admin
from .models import CustomeUser, JWTToken

admin.site.register(CustomeUser)
admin.site.register(JWTToken)
