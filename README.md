# My Vocaby

A flash card web application. The aim of the application is making easy to searching and learning english words and keep the word in digital environment not on the wall :)

<ins>___Quick look:___ [YouTube](https://youtu.be/aayuGPxZ0qs)</ins>

# How to run
Python 3 latest version must be installed.

First you need to install python packages in requirements.txt.

```bash
pip install -r requirements.txt
```
Then, start server.

```bash
python3 manage.py runserver
```

# Test user
**username:** harry

**password:** 12341234

# Available words
The app use Oxford Dictionary API.

You need API credentials for full usage.

Look at [https://developer.oxforddictionaries.com](https://developer.oxforddictionaries.com)

**Available words;**

* Otherwise
* Enhance
* Gathering
* Merely
* Magic
* Fly
* Prospect
* Vast

# How to load API credentials
Please create .env file in ___myvocaby___ folder.

.env file should looks like;
```bash
API_URL = <your api url>
APP_ID = <your app id>
API_KEY = <your api key>
```