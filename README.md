![AI_devs 3](https://cloud.overment.com/aidevs_3-1720683722.png)

Niniejsze repozytorium to aplikacja, którą wykorzystaliśmy na potrzeby DEMO podczas pierwszego live AI_devs 3 ["O co chodzi z tymi agentami?"](https://www.youtube.com/watch?v=eJ6v2ldk1nc). Kod agenta jest w NIEZMIENIONEJ formie z wyjątkiem dodania komentarzy widocznych w kodzie oraz endpointu do wgrywania pliku na serwer (zachowanie jest takie samo jak w oryginale, ale ułatwia uruchomienie projektu lokalnie).

## Przegląd bez instalacji

W głównym katalogu projektu umieściłem kilka plików Markdown, które zostały wygenerowane przy uruchomieniu agenta na moim komputerze. Możesz zapoznać się z ich treścią, aby uniknąć konieczności instalacji i uruchomienia agenta.

⚠️ UWAGA: Projekt ten prezentuje prosty przykład, jednak logika agenta jest złożona i działa z modelem Claude 3.5 Sonnet. Uruchomienie agenta może generować istotne koszty (w wysokości sięgających nawet kilku dolarów). Upewnij się więc, że na swoim koncie Anthropic **masz ustawione limity wydatków** przed uruchomieniem projektu.

## Dodatkowy komentarz

- W pliku /src/lib/prompts.ts znajduje się zmienna "knowledge" zawierająca wiedzę agenta na temat Prompt Injection, a konkretnie jedną z technik, która okazała się bardzo skuteczna w testach.
- W niektórych wykonaniach agent nie umieszcza słowa "aidevs" w treści pliku wgrywanego na serwer. Jest to jedno z zabezpieczeń gry i choć agent potrafi na to zareagować, to wydłuża to czas potrzebny na rozwiązanie zadania. Jest to sytuacja losowa i nie mogłem jej zreplikować w ostatnich próbach. Nie powinna jednak generować problemów związanych z przejściem gry.
- Pomimo dostępności [Function Calling](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) w Anthropic, zdecydowałem się na pokazanie sytuacji, w której opieramy się wyłącznie na promptach. Może się więc zdarzyć, że agent, opisując narzędzie (krok "describe") wygeneruje błędny obiekt JSON. Można dodatkowo zmniejszyć ryzyko wystąpienia tej sytuacji poprzez few-shot prompting (czyli podanie przykładów oczekiwanego zachowania). 
- Agent **nie zawsze** kończy grę pomyślnie. Problem, który napotkałem, dotyczył sytuacji, gdy game.aidevs.pl przestaje odpowiadać. Możliwe, że istnieją też inne problemy, których nie wykryłem. Uruchomiłem agenta na swoim komputerze kilkadziesiąt razy. W ostatnich kilkunastu próbach, za każdym razem podawał poprawne hasło. 

## Instalacja

Aby uruchomić projekt na swoim komputerze:

- pobierz to repozytorium
- zmień nazwę pliku .env.example na .env
- dodaj klucz API do usługi Anthropic (możesz go uzyskać [tutaj](https://console.anthropic.com/settings/keys))
- zainstaluj i uruchom bezpłatną wersję [ngrok](https://ngrok.com/) (to usługa umożliwiająca **tymczasowe** udostępnienie lokalnego serwera w Internecie)
- wygenerowany przez NGROK adres URL wpisz w pliku .env jako wartość dla klucza UPLOAD_DOMAIN


``` bash
git clone https://github.com/iceener/aidevs-agent-cracker.git
echo "ANTHROPIC_API_KEY=add_your_api_key_here" > .env
echo "UPLOAD_DOMAIN=domain_generated_by_ngrok a file" >> .env
npm install
npx playwright install
npm dev
```

## Endpoint do wgrywania pliku

Na nagraniu odtworzonym w trakcie live'a korzystałem z własnego serwera do uploadu plików. Aby ułatwić uruchomienie projektu na Twojej maszynie, dodałem endpoint do wgrywania plików do katalogu /uploads i ustawiłem je adres narzędzia którym posługuje się agent.

Aby to zadziałało, musisz skorzystać z bezpłatnej wersji NGROK w celu udostępnienia localhost'a w Internecie. Po uruchomieniu NGROK poleceniem:

```bash
ngrok http localhost:3000
```

Otrzymasz nazwę domeny w formacie https://IDENTYFIKATOR.ngrok-free.app. Wpisz ją jako wartość dla klucza UPLOAD_DOMAIN w pliku .env.

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