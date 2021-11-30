from django.contrib import admin
from .models import User, Vocabulary, HistoryOfWords

class UserList(admin.ModelAdmin):
  list_display = ("username", "id")
  filter_horizontal = ("words",)

class WordList(admin.ModelAdmin):
  list_display = ("id", "word", "type", "definition", "timestamp")

class HistoryOfWordList(admin.ModelAdmin):
  list_display = ("id", "owner", "word", "timestamp")
    
admin.site.register(User, UserList)
admin.site.register(Vocabulary, WordList)
admin.site.register(HistoryOfWords, HistoryOfWordList)
