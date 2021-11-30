from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
  words = models.ManyToManyField("Vocabulary", blank=True, related_name="owner")

class Vocabulary(models.Model):
  word = models.CharField(max_length=60)
  type = models.CharField(max_length=60)
  definition = models.CharField(max_length=900)
  example = models.CharField(max_length=900)
  timestamp = models.DateTimeField(auto_now_add=True)
  
  def serialize(self):
    return {
      "id": self.id,
      "word": self.word,
      "type": self.type,
      "definition": self.definition,
      "example": self.example
    }

class HistoryOfWords(models.Model):
  owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="word_date")
  word = models.ForeignKey("Vocabulary", on_delete=models.CASCADE, related_name="owner_date")
  timestamp = models.DateTimeField(auto_now_add=True)