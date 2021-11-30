from django.urls import path
from . import views

urlpatterns = [
  path("", views.login, name="login"),
  path("login", views.login, name="login"),
  path("signup", views.signup, name='signup'),
  path("home", views.home, name="home"),
  path("logout", views.logout, name="logout"),
  path("quiz", views.quiz, name="quiz"),

  path("api/removeword", views.removeWord, name="removeWord"),
  path("api/search", views.searchWord, name="searchWord"),
  path("api/saveword", views.saveWord, name="saveWord"),
  path("api/questions", views.questions, name="questions")
]