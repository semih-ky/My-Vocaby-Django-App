import json
from json.decoder import JSONDecodeError
import re
import requests
import os
from dotenv import load_dotenv

from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login as user_login, logout as user_logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Q

from .models import User, Vocabulary, HistoryOfWords


def login(request):
  if request.method == "POST":
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
      user_login(request, user)
      return HttpResponseRedirect(reverse("home"))
    else:
      return render(request, "myvocaby/login.html", {
          "error": "Invalid username and/or password."
        })
  else:
    return render(request, "myvocaby/login.html")

def signup(request):
  if request.method == "POST":
    username = request.POST["username"]
    password = request.POST["password"]
    re_password = request.POST["rePassword"]
    
    if len(username) < 3 or re.search("\s", username) != None:
      return render(request, "myvocaby/signup.html", {
        "error": "Invalid username!"
      })

    if len(password) < 8 or re.search("\s", password) != None :
      return render(request, "myvocaby/signup.html", {
        "error": "Password must be more than 8 char and does not contain whitespace!"
      })

    if password != re_password:
      return render(request, "myvocaby/signup.html", {
        "error": "Password does not match!"
      })

    try:
      user = User.objects.create_user(username=username, password=password)
      user.save()
    except IntegrityError:
      return render(request, "myvocaby/signup.html", {
        "error": "Username has already existed"
      })
    user_login(request, user)
    return HttpResponseRedirect(reverse("home"))
  else:
    return render(request, "myvocaby/signup.html")

@login_required(login_url='/')
def home(request):
  user = User.objects.get(id=request.user.id)
  if user.words.count() <= 0:
    return render(request, "myvocaby/home.html", {
      "histories": False
    })
  histories = HistoryOfWords.objects.filter(owner=user).order_by("-timestamp")
  return render(request, "myvocaby/home.html", {
    "histories": histories
  })

def logout(request):
  user_logout(request)
  return HttpResponseRedirect(reverse("login"))

@login_required(login_url='/')
def removeWord(request):
  if request.method != "POST":
    return JsonResponse({"error": "Only POST request allowed."}, status=400)
  
  user = User.objects.get(id=request.user.id)

  try:
    data = json.loads(request.body)
  except JSONDecodeError:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  try:
    wordId = int(data.get("wordId", "0"))
  except ValueError:
    return JsonResponse({"error": "Id must be digit"}, status=400)
  
  if wordId == 0:
    return JsonResponse({"error": "Please enter word id!"}, status=400)

  try:
    word = Vocabulary.objects.get(id=wordId)
  except Vocabulary.DoesNotExist:
    return JsonResponse({"error": "Word is not exist!"}, status=400)

  user.words.remove(word)
  HistoryOfWords.objects.filter(Q(owner=user) & Q(word=word)).delete()
  
  return JsonResponse({"message": "Successfully removed"}, status=200)
  
def getWordDatas(data):
  results = data
  
  for result in results:
    lexicalEntries = result["lexicalEntries"]
    for lexicalEntry in lexicalEntries:
      entries = lexicalEntry["entries"]
      type_of_word = lexicalEntry["lexicalCategory"]["id"]
      for entry in entries:
        if "senses" in entry:
          senses = entry["senses"]
          for sense in senses:
            if "definitions" in sense and "examples" in sense:
              definition = sense["definitions"][0]
              example = sense["examples"][0]["text"]
              return {
                "type_of_word": type_of_word, 
                "definition": definition, 
                "example": example
              }
            else:
              if "subsenses" in sense:
                subsenses = sense["subsenses"]
                for subsense in subsenses:
                  if "definitions" in subsense and "examples" in subsense:
                    definition = subsense["definitions"][0]
                    example = subsense["examples"][0]["text"]
                    return {
                      "type_of_word": type_of_word, 
                      "definition": definition, 
                      "example": example
                    }

  return False

@login_required(login_url='/')
def searchWord(request):
  if request.method != "POST":
    return JsonResponse({"error": "Only POST request allowed."}, status=400)

  try:
    data = json.loads(request.body)
  except JSONDecodeError:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  new_word = data.get("word", "").lower()

  if not new_word:
    return JsonResponse({"error": "Please enter word."}, status=400)

  word_in_db = Vocabulary.objects.filter(word=new_word)

  if word_in_db.count() > 0:
    word = word_in_db[0]
    return JsonResponse(word.serialize(), status=200)
  else:
    return JsonResponse({"error": "Please look at line 171 in views.py file"}, status=400)
    
  # You need Oxford Dict. API URL, APP ID and API KEY for the followings lines to work
  # Please go to https://developer.oxforddictionaries.com
  # When you create your .env file and load creadentials
  # Delete line 168 and line 169 then activate below lines

  # load_dotenv()

  # API_URL = os.getenv('API_URL')
  # APP_ID = os.getenv('APP_ID')
  # API_KEY = os.getenv('API_KEY')
  # language = 'en-us'
  # strictMatch = 'false'
  # fields = 'definitions%2Cexamples'

  # url = API_URL + '/entries/' + language + "/" + new_word + '?fields=' + fields + '&strictMatch=' + strictMatch
  # r = requests.get(url, headers = {'app_id': APP_ID, 'app_key': API_KEY})

  # if r.status_code == 404:
  #   return JsonResponse({"error": "No word matching in dictionary."}, status=404)

  # if r.status_code != 200:
  #   return JsonResponse({"error": "Something went wrong."}, status=400)
  
  # oxford_data = r.json()

  # word_datas = getWordDatas(oxford_data["results"])

  # if not word_datas:
  #   return JsonResponse({"error": "Word not found."}, status=400)

  # word = Vocabulary(
  #   word=new_word, 
  #   type=word_datas["type_of_word"], 
  #   definition=word_datas["definition"], 
  #   example=word_datas["example"]
  # )
  # word.save()

  # return JsonResponse(word.serialize(), status=200)

@login_required(login_url='/')
def saveWord(request):
  if request.method != "POST":
    return JsonResponse({"error": "Only POST request allowed."}, status=400)
  
  try:
    data = json.loads(request.body)
  except JSONDecodeError:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  try:
    word_id = int(data.get("wordId", "0"))
  except ValueError:
    return JsonResponse({"error": "Id must be digit"}, status=400)

  if word_id == 0:
    return JsonResponse({"error": "Please enter word id!"}, status=400)
  
  try:
    new_word = Vocabulary.objects.get(id=word_id)
  except Vocabulary.DoesNotExist:
    return JsonResponse({"error": "Word is not exist!"}, status=400)

  user = User.objects.get(id=request.user.id)

  if user.words.filter(id=word_id).count() == 0:
    user.words.add(new_word)
    history = HistoryOfWords(owner=user, word=new_word)
    history.save()

  return JsonResponse({"message": "Successfully saved"}, status=200)

@login_required(login_url='/')
def quiz(request):
  return render(request, "myvocaby/quiz.html")

@login_required(login_url='/')
def questions(request):
  if request.method != "POST":
    return JsonResponse({"error": "Only POST request allowed."}, status=400)
  
  user = User.objects.get(id=request.user.id)

  try:
    data = json.loads(request.body)
  except JSONDecodeError:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  try:
    number_of_questions = int(data.get("numberOfQuestions", "0"))
  except ValueError:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  if number_of_questions == 0:
    return JsonResponse({"error": "Something went wrong!"}, status=400)

  user_words = user.words.all()
  if user_words.count() < number_of_questions:
    return JsonResponse({"error": f"You don't have at least {number_of_questions} word cards!"}, status=400)

  return JsonResponse({"words": [words.serialize() for words in user_words]}, safe=False , status=200)