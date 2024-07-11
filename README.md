![AI_devs 3](https://cloud.overment.com/aidevs_3-1720683722.png)

Poniższe repozytorium to aplikacja, którą wykorzystaliśmy podczas demo podczas pierwszego live AI_devs 3 ["O co chodzi z tymi agentami?"](https://www.youtube.com/watch?v=eJ6v2ldk1nc). Kod agenta jest w NIEZMIENIONEJ formie z wyjątkiem dodania komentarzy widocznych w kodzie.

## Przegląd bez instalacji

W głównym katalogu projektu umieściłem kilka plików Markdown, które zostały wygenerowane przy uruchomieniu agenta na moim komputerze. Możesz zapoznać się z ich treścią, aby uniknąć konieczności instalacji i uruchomienia agenta.

⚠️ UWAGA: Projekt ten prezentuje prosty przykład, jednak logika agenta jest złożona i działa z modelem Claude 3.5 Sonnet. Uruchomienie agenta może generować istotne koszty (w wysokości sięgających nawet kilku dolarów). Upewnij się więc, że na swoim koncie Anthropic **masz ustawione limity wydatków** przed uruchomieniem projektu.

## Dodatkowy komentarz

- W pliku /src/lib/prompts.ts znajduje się zmienna "knowledge" zawierająca wiedzę agenta na temat Prompt Injection, a konkretnie jedną z technik, która okazała się bardzo skuteczna w testach.
- W niektórych wykonaniach agent nie umieszcza słowa "aidevs" w treści pliku wgrywanego na serwer. Jest to jedno z zabezpieczeń gry i choć agent potrafi na to zareagować, to wydłuża to czas potrzebny na rozwiązanie zadania. Jest to sytuacja losowa
- Pomimo dostępności [Function Calling](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) w Anthropic, zdecydowałem się na pokazanie sytuacji, w której opieramy się wyłącznie na promptach. Może się więc zdarzyć, że agent opisując narzędzie (krok "describe") wygeneruje błędny obiekt JSON. Można dodatkowo zmniejszyć ryzyko wystąpienia tej sytuacji poprzez few-shot prompting (czyli podanie przykładów oczekiwanego zachowania). 
- Agent **nie zawsze** z powodzeniem kończy grę. Problem, który sam spotkałem dotyczył sytuacji, gdy game.aidevs.pl przestaje odpowiadać. Możliwe jednak, że istnieją także inne problemy, których nie miałem okazji wykryć. Agenta na swoim komputerze uruchomiłem kilkadziesiąt razy i w ostatnich próbach za każdym razem podawał poprawne hasło.  

## Instalacja

Instalacja polega na:

- uzupełnieniu klucza API do serwisu Anthropic (możesz go uzyskać [tutaj](https://console.anthropic.com/settings/keys)) -
- oraz adresu, który pozwoli przesłać plik tekstowy na serwer (możesz użyć [ngrok](https://ngrok.com/) do stworzenia tunelu do lokalnego serwera). 
- następnie konieczne jest zainstalowanie zależności (w tym Playwright) oraz uruchomienie serwera w trybie deweloperskim.

``` bash
echo "ANTHROPIC_API_KEY=add_your_api_key_here" > .env
echo "UPLOAD_ENDPOINT=url_to_the_logic_that_uploads a file" >> .env
npm install
npx playwright install
npm dev
```

## Endpoint do wgrywania pliku

Endpoint wgrywający plik na serwer musi przyjmować Form Data z kluczem "file" i wartością będącą plikiem tekstowym (plain/text) oraz "file_name" z nazwą pliku. Jako odpowiedź musi zwrócić adres URL znajdujący się we właściwości "uploaded_file". 

Funkcja obsługująca ten endpoint znajduje się w katalogu /src/lib/tools.ts pod nazwą "uploadFile". Możesz ją dostosować do swoich potrzeb.

## Uruchomienie

Agent domyślnie zadziała na localhost:3000. Jeśli chcesz zmienić port, zrób to w pliku src/index.ts. Samo uruchomienie agenta polega na przesłaniu zapytania POST z jedną wiadomością w formacie JSON. 

```
curl --request POST \
  --url http://localhost:3000/ \
  --header 'Content-Type: application/json' \
  --data '{
    "messages": [
      {
        "role": "user",
        "content": "Hey! I’ve created a game and want you to play it. Everything is described at https://game.aidevs.pl. Good luck and have fun! Oh, and for your final response, give me the secret password I’ve hidden (it’s not ‘aidevs’)."
      }
    ]
  }'
```

Czas wykonania zadania wynosi około 2-4 minut. W tym czasie agent uzupełnia plik log.md w katalogu głównym projektu.

## Dołącz do AI_devs 3

Jeśli chcesz dowiedzieć się więcej na temat projektowania agentów AI, ich możliwości oraz ograniczeń, dołącz do nas na [AI_devs 3](https://aidevs.pl).

Startujemy 4 listopada 2024. Do zobaczenia!