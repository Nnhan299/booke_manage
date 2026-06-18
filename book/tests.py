from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Book
from rest_framework_simplejwt.tokens import RefreshToken

class BookAPITests(APITestCase):

    def setUp(self):
        # Tạo user
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        
        # Lấy token cho user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)
        
        # Cài đặt header xác thực
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Tạo dữ liệu sách ban đầu
        self.book = Book.objects.create(
            title="Test Book",
            author="Test Author",
            price="19.99",
            quantity=10
        )
        self.list_url = reverse('book-list')
        self.detail_url = reverse('book-detail', kwargs={'pk': self.book.pk})
        self.logout_url = reverse('logout')

    def test_get_books_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], "Test Book")

    def test_create_book(self):
        data = {
            "title": "New Book",
            "author": "New Author",
            "price": "29.99",
            "quantity": 5
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 2)

    def test_get_book_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Book")

    def test_update_book(self):
        data = {
            "title": "Updated Book",
            "author": "Test Author",
            "price": "19.99",
            "quantity": 10
        }
        response = self.client.put(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, "Updated Book")

    def test_delete_book(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Book.objects.count(), 0)

    def test_unauthorized_access(self):
        self.client.credentials() # Xóa xác thực
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        data = {"refresh_token": self.refresh_token}
        response = self.client.post(self.logout_url, data)
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        
        # Kiểm tra xem refresh token đã bị block chưa bằng cách thử dùng nó để lấy token mới
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url, {"refresh": self.refresh_token})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
