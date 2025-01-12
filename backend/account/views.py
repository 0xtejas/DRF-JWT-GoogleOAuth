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
        flow = Flow.from_client_config(
            client_secret_json,
            scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            redirect_uri=os.getenv('GOOGLE_REDIRECT_URI')
        )
        authorization_url, state = flow.authorization_url(prompt='consent')
        request.session['state'] = state
        return redirect(authorization_url)
    

class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        state = request.session.get('state')

        if not state:
            return HttpResponseBadRequest('Invalid state parameter')

        client_secret_json = json.loads(os.getenv('GOOGLE_CLIENT_SECRET_JSON'))
        flow = Flow.from_client_config(
            client_secret_json,
            scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            redirect_uri=os.getenv('GOOGLE_REDIRECT_URI')
        )

        flow.fetch_token(authorization_response=request.build_absolute_uri())
        credentials = flow.credentials      
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, google_request.Request(), os.getenv('GOOGLE_CLIENT_ID')
        )

        user, _ = User.objects.get_or_create(
            google_id=id_info['sub'],
            defaults={'username': id_info['email'], 'email': id_info['email']}
        )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        JWTToken.objects.create(
            user=user,
            token=refresh_token,
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=7)
        )

        return redirect(f'{os.getenv("FRONTEND_URL")}/login?access_token={access_token}&refresh_token={refresh_token}')
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'message': 'Missing Refresh Token'}, status=403)
        
        try:
            RefreshToken(refresh_token)
        except (InvalidToken, TokenError):
            return Response({'message': 'Invalid Refresh Token'}, status=403)

        JWTToken.objects.filter(token=refresh_token).delete()
        request.session.flush()

        return Response({'message': 'Logout Successful'})


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh', None)
        if not refresh_token:
            return Response({'message': 'Refresh token is required'}, status=400)
        
        try:
            token = RefreshToken(refresh_token)
            if not JWTToken.objects.filter(token=refresh_token).exists():
                return Response({'message': 'Token revoked'}, status=401)

            return Response({'access_token': str(token.access_token)})
        except (InvalidToken, TokenError):
            return Response({'message': 'Invalid or expired token. Please log in again.'}, status=400)
        except Exception as e:
            logger.error(f'Token refresh failed: {str(e)}', exc_info=True)
            return Response({'message': 'Token refresh failed', 'error': str(e)}, status=400)            
        
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
                    return redirect('/admin/')
                
                return Response({'message': 'Unauthorized'}, status=403)
            return Response({'message': 'Authorization Header missing'}, status=401)

        except Exception as e:
            logger.error('Authentication Failed', exc_info=True)
            return Response({'message': 'Authentication Failed', 'error': str(e)}, status=401)