from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser): 
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Added related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',  # Added related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def save(self, *args, **kwargs):
        if not self.password:
            self.set_unusable_password()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class JWTToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  
    token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return self.user.username