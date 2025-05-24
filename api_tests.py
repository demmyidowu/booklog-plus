import requests

response = requests.get("https://api.chucknorris.io/jokes/random")
data = response.json()
print("🥋 Chuck Norris fact:", data["value"])
