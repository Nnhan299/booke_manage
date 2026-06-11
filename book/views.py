from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Book
from .serializers import BookSerializer
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

class BookListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Custom Filtering
        queryset = Book.objects.all().order_by('id')
        
        title = request.query_params.get('title')
        author = request.query_params.get('author')
        price_min = request.query_params.get('price_min')
        price_max = request.query_params.get('price_max')
        quantity_min = request.query_params.get('quantity_min')
        quantity_max = request.query_params.get('quantity_max')

        if title:
            queryset = queryset.filter(title__icontains=title.strip())
        if author:
            queryset = queryset.filter(author__icontains=author.strip())
        if price_min:
            try:
                queryset = queryset.filter(price__gte=float(price_min))
            except ValueError:
                pass
        if price_max:
            try:
                queryset = queryset.filter(price__lte=float(price_max))
            except ValueError:
                pass
        if quantity_min:
            try:
                queryset = queryset.filter(quantity__gte=int(quantity_min))
            except ValueError:
                pass
        if quantity_max:
            try:
                queryset = queryset.filter(quantity__lte=int(quantity_max))
            except ValueError:
                pass

        # 2. Custom Pagination
        page_size_param = request.query_params.get('page_size')
        page_size = 20
        if page_size_param == '100':
            page_size = 100

        page_number = request.query_params.get('page', 1)
        paginator = Paginator(queryset, page_size)

        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        serializer = BookSerializer(page_obj.object_list, many=True)
        
        return Response({
            'count': paginator.count,
            'next': self.get_next_link(request, page_obj),
            'previous': self.get_previous_link(request, page_obj),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_next_link(self, request, page_obj):
        if not page_obj.has_next():
            return None
        url = request.build_absolute_uri(request.path)
        params = request.GET.copy()
        params['page'] = page_obj.next_page_number()
        return f"{url}?{params.urlencode()}"

    def get_previous_link(self, request, page_obj):
        if not page_obj.has_previous():
            return None
        url = request.build_absolute_uri(request.path)
        params = request.GET.copy()
        params['page'] = page_obj.previous_page_number()
        return f"{url}?{params.urlencode()}"


class BookDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Book, pk=pk)

    def get(self, request, pk):
        book = self.get_object(pk)
        serializer = BookSerializer(book)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        book = self.get_object(pk)
        serializer = BookSerializer(book, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        book = self.get_object(pk)
        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        book = self.get_object(pk)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
