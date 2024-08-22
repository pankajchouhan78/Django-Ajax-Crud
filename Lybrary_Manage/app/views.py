from django.contrib.auth.models import Permission, User
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.shortcuts import render
from django.db.models import Q
from app.models import Book


def index(request):
    users = User.objects.all()
    user_permissions = {}
    for user in users:
        user_perm_list = [perm.codename for perm in user.user_permissions.all()]
        user_permissions[user.username] = user_perm_list
    return render(request, "index.html", {"user_permissions": user_permissions})


def dashboard(request):
    user_permission = request.user.user_permissions.all()
    permision_list = [permission.codename for permission in user_permission]

    if request.method == "POST":
        books = Book.objects.all()
        search_value = request.POST.get("search_value", None)
        if search_value is not None:
            books = Book.objects.filter(Q(title__icontains=search_value) | Q(description__icontains=search_value))

        books_data = list(books.values("id", "title", "description"))
        return JsonResponse({"Books": books_data, "permision_list": permision_list})

    return render(request, "dashboard.html", {"permision_list": permision_list})


def create(request):
    if request.method == "POST":
        title = request.POST.get("title")
        if Book.objects.filter(title=title).exists():
            return JsonResponse({"status": 400, 'message': 'Book already exists'}, status=400)
        book = Book(
            title=title,
            description=request.POST.get("description"),
        )
        book.save()
        book_data = {
            "id": book.id,
            "title": book.title,
            "description": book.description,
            "date_created": 1,
        }
        return JsonResponse({"status": "success", "data": book_data})


def update(request):
    if request.method == "POST":
        id = request.POST.get("book_id")
        status = request.POST.get("status", None)
        try:
            book = Book.objects.get(id=id)
        except Book.DoesNotExist:
            return JsonResponse(
                {"status": "404 Not Found", "message": "Book does not exist"}
            )

        if status:
            book_data = {
                "id": book.id,
                "title": book.title,
                "description": book.description,
            }
            return JsonResponse({"status": 200, "data": book_data})
        else:
            book.title = request.POST.get("title")
            book.description = request.POST.get("description")
            book.save()

            book_data = {
                "id": book.id,
                "title": book.title,
                "description": book.description,
            }
            return JsonResponse(
                {"status": "Book updated successfully", "data": book_data}
            )


def delete(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            id = request.POST.get("book_id", None)
            try:
                book = Book.objects.get(id=id)
            except Book.DoesNotExist:
                return JsonResponse(
                    {"status": "error", "message": "Book Does Not Exists"}
                )
            book.delete()
            response_data = {
                "status": "success",
                "message": "Book deleted successfully!",
            }
            return JsonResponse(response_data)
