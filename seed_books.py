import os
import django
import random

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'book_manage.settings')
django.setup()

from django.contrib.auth.models import User
from book.models import Book

def seed():
    # 1. Create a superuser / test user if it doesn't exist
    username = 'admin'
    password = 'password123'
    email = 'admin@example.com'
    
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email,
        'is_staff': True,
        'is_superuser': True
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"Created admin user: username={username}, password={password}")
    else:
        print(f"Admin user already exists: username={username}")
        
    # 2. Clear existing books to make it clean
    Book.objects.all().delete()
    print("Deleted all existing books.")

    # 3. Create 105 mock books
    titles = [
        "Django", "Python", "JavaScript", "HTML", "CSS", 
        "React", "Vue", "Angular", "Node.js", "Express",
        "PostgreSQL", "SQLite", "MongoDB", "Docker", "Kubernetes",
        "Git", "GitHub", "API Design", "Microservices", "System Design",
        "Data Structures", "Algorithms", "Machine Learning", "Deep Learning", "Artificial Intelligence"
    ]
    prefixes = ["Introduction to", "Advanced", "Mastering", "Learning", "The Art of", "Foundations of", "Exploring", "Understanding"]
    suffixes = ["for Beginners", "Cookbook", "Handbook", "in Action", "Guide", "Pro", "Demystified", "Crash Course"]

    authors = [
        "J.K. Rowling", "George R.R. Martin", "J.R.R. Tolkien", "Stephen King", "Agatha Christie",
        "Dan Brown", "Ernest Hemingway", "F. Scott Fitzgerald", "Mark Twain", "Charles Dickens",
        "Arthur Conan Doyle", "William Shakespeare", "John Doe", "Jane Smith", "Alex Johnson",
        "Emily Davis", "Michael Brown", "David Wilson", "Sarah Miller", "James Taylor"
    ]

    books_to_create = []
    
    # We generate exactly 105 books
    for i in range(1, 106):
        if i == 1:
            title = "Special Django Web Development Guide"
            author = "Special Author Antigravity"
            price = 49.99
            quantity = 15
        elif i == 2:
            title = "Super Secret Python Algorithms Book"
            author = "Python Master Mind"
            price = 99.95
            quantity = 5
        elif i == 3:
            title = "A Unique Harry Potter Fanfic"
            author = "J.K. Rowling"
            price = 19.99
            quantity = 120
        else:
            prefix = random.choice(prefixes)
            title_base = random.choice(titles)
            suffix = random.choice(suffixes)
            title = f"{prefix} {title_base} {suffix} (Vol. {random.randint(1, 5)})"
            author = random.choice(authors)
            price = round(random.uniform(5.99, 150.00), 2)
            quantity = random.randint(1, 150)
            
        books_to_create.append(Book(
            title=title,
            author=author,
            price=price,
            quantity=quantity
        ))

    Book.objects.bulk_create(books_to_create)
    print(f"Successfully created 105 books.")

if __name__ == '__main__':
    seed()
