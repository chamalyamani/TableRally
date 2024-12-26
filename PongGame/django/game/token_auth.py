from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import AccessToken
from authentication.models import CustomUser as User

class   TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner
    print("Goooooooooooood accessed here")
    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_dic = parse_qs(query_string)
        print("Goooooooooooood continue ")
        if 'Token' in query_dic:
            try:
                print("Goooooooooooood Nice")
                token_key = query_dic['Token'][0]
                access_token = AccessToken(token_key)
                user_id = access_token.payload['user_id']
                user = await database_sync_to_async(User.objects.get)(id=user_id)
                scope['user'] = user
            except Exception:
                scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))