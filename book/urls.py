from django.urls import path
from .views import BookListCreateAPIView, BookDetailAPIView, LogoutAPIView

urlpatterns = [
    path('api/books/', BookListCreateAPIView.as_view(), name='book-list'),
    path('api/books/<int:pk>/', BookDetailAPIView.as_view(), name='book-detail'),
    path('api/logout/', LogoutAPIView.as_view(), name='logout'),
]

