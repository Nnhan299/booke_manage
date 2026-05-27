from django.http import HttpResponse
from .models import Book

def index(request):
    books = Book.objects.all()
    html = "<h1>Danh sach sach</h1><ul>"
    for book in books:
        html += f"<li>{book.title} - {book.author} - {book.price} - SL: {book.quantity}</li>"
    html += "</ul>"
    return HttpResponse(html)
