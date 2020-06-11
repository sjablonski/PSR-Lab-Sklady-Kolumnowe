# PSR-Lab-Sklady-Kolumnowe

## Uruchamianie aplikacji
Aplikacje do uruchomienia wymagają środowiska uruchomieniowego Node (https://nodejs.org/en/download/). Następnie w folderze z projektem (SerwisSamochodowyCassandra lub SerwisSamochodowyInfluxDB) należy uruchomić konsolę i wpisać polecenie `npm install`. Po pozytywnym zainstalowaniu wszystkich dependencji należy wpisać polecenie `node index.js`. Uruchomi ono aplikację, która jest dostępna pod adresem `http://localhost:3001/`.

Pliki odpowiedzialne za logię komunikacji ze składem klumnowym znajdują się w folderze `controllers`.

Do stworzenia aplikacji zostały wykorzystane biblioteki takie jak:
- body-parser: `https://www.npmjs.com/package/body-parser`
- ejs: `https://www.npmjs.com/package/ejs`
- express: `https://www.npmjs.com/package/express`
- method-override: `https://www.npmjs.com/package/method-override`
- uuid: `https://www.npmjs.com/package/uuid`
- DataStax Node.js Driver for Apache Cassandra®: `https://www.npmjs.com/package/cassandra-driver`
- InfluxDB: `https://www.npmjs.com/package/influx`
