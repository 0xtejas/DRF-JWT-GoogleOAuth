import os, json, logging
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import redirect
from django.http import HttpResponseBadRequest
from django.contrib.auth import get_user_model, login, authenticate
from django.utils import timezone
from google.oauth2 import id_token
from google.auth.transport import requests as google_request
from google_auth_oauthlib.flow import Flow
from .models import JWTToken

logger = logging.getLogger(__name__)

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client_secret_json = json.loads(os.getenv('GOOGLE_CLIENT_SECRET_JSON'))
        client_id = client_secret_json['web']['client_id']
        redirect_uri = client_secret_json['web']['redirect_uris'][0]
        flow = Flow.from_client_config(
            client_secret_json,
            scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            redirect_uri=redirect_uri
        )
        authorization_url, state = flow.authorization_url(prompt='consent')
        request.session['state'] = state
        return redirect(authorization_url)
    

class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        state = request.session.get('state')

        if not state:
            return HttpResponseBadRequest({'message': 'Invalid state parameter', 'alertColor': 'danger'})

        client_secret_json = json.loads(os.getenv('GOOGLE_CLIENT_SECRET_JSON'))
        client_id = client_secret_json['web']['client_id']
        redirect_uri = client_secret_json['web']['redirect_uris'][0]
        flow = Flow.from_client_config(
            client_secret_json,
            scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            redirect_uri=redirect_uri
        )

        flow.fetch_token(authorization_response=request.build_absolute_uri())
        credentials = flow.credentials      
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, google_request.Request(), client_id
        )

        user, created = User.objects.get_or_create(
            google_id=id_info['sub'],
            defaults={
                'username': id_info['email'],
                'email': id_info['email'],
                'first_name': id_info.get('given_name', ''),
                'last_name': id_info.get('family_name', ''),
                'profile_picture': id_info.get('picture', '')
            }
        )

        if not created:
            user.first_name = id_info.get('given_name', '')
            user.last_name = id_info.get('family_name', '')
            user.profile_picture = id_info.get('picture', '')
            user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        token_expiry = (timezone.now() + timedelta(days=7)).timestamp() * 1000  # Convert to milliseconds

        JWTToken.objects.create(
            user=user,
            token=refresh_token,
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=7)
        )

        return redirect(f'{os.getenv("FRONTEND_URL")}/home/?access_token={access_token}&refresh_token={refresh_token}&token_expiry={int(token_expiry)}&alertColor=success')
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'message': 'Missing Refresh Token', 'alertColor': 'warning'}, status=403)
        
        try:
            RefreshToken(refresh_token)
        except (InvalidToken, TokenError):
            return Response({'message': 'Invalid Refresh Token', 'alertColor': 'danger'}, status=403)

        JWTToken.objects.filter(token=refresh_token).delete()
        request.session.flush()

        return Response({'message': 'Logout Successful', 'alertColor': 'success'})


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh', None)
        if not refresh_token:
            return Response({'message': 'Refresh token is required', 'alertColor': 'warning'}, status=400)
        
        try:
            token = RefreshToken(refresh_token)
            if not JWTToken.objects.filter(token=refresh_token).exists():
                return Response({'message': 'Token revoked', 'alertColor': 'danger'}, status=401)

            return Response({'access_token': str(token.access_token), 'alertColor': 'success'})
        except (InvalidToken, TokenError):
            return Response({'message': 'Invalid or expired token. Please log in again.', 'alertColor': 'danger'}, status=400)
        except Exception as e:
            logger.error(f'Token refresh failed: {str(e)}', exc_info=True)
            return Response({'message': 'Token refresh failed', 'error': str(e), 'alertColor': 'danger'}, status=400)            
        
class AdminRedirectView(APIView):
    permission_classes =[IsAuthenticated]

    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            return redirect('/admin/')
        return Response({'message': 'Unauthorized'}, status=403)
    
class AdminAutoLoginView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.debug(f'Received {request.method} request at {request.path}')
        jwt_authenticator = JWTAuthentication()
        try:
            # Extract and validate the JWT Token
            auth_header = request.headers.get('Authorization')
            if auth_header:
                token = auth_header.split(' ')[1]  # Fix the split logic
                validated_token = jwt_authenticator.get_validated_token(token)
                user = jwt_authenticator.get_user(validated_token)

                # Authenticate the user and establish a session
                if user.is_staff or user.is_superuser:
                    login(request, user)
                    return Response({'message': 'Login successful', 'alertColor': 'success'}, status=200)
                
                return Response({'message': 'Unauthorized', 'alertColor': 'danger'}, status=403)
            return Response({'message': 'Authorization Header missing', 'alertColor': 'warning'}, status=401)

        except InvalidToken:
            return Response({'message': 'Token is invalid or expired', 'alertColor': 'danger'}, status=401)
        except Exception as e:
            logger.error('Authentication Failed', exc_info=True)
            return Response({'message': 'Authentication Failed', 'error': str(e), 'alertColor': 'danger'}, status=401)

class VerifyTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.headers.get('Authorization').split(' ')[1]
        try:
            jwt_authenticator = JWTAuthentication()
            validated_token = jwt_authenticator.get_validated_token(token)
            jwt_authenticator.get_user(validated_token)
            return Response({'message': 'Token is valid'}, status=200)
        except (InvalidToken, TokenError):
            return Response({'message': 'Invalid or expired token'}, status=401)
        except Exception as e:
            logger.error('Token verification failed', exc_info=True)
            return Response({'message': 'Token verification failed', 'error': str(e)}, status=400)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'email': user.email,
            'username': user.username,
            'profile_picture': user.profile_picture
    }, status=200)

