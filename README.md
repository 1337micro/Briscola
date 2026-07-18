# To play the game:
http://briscola.xyz/
</br>

## Environment variables (.env)

The backend reads its MongoDB connection settings from a `.env` file in the
project root. To create one, copy the sample file:

```
copy .env.example .env
```
(or `cp .env.example .env` on Mac/Linux)

The defaults work out of the box with the MongoDB container included in
`docker-compose.yml`. To use a different database (e.g. MongoDB Atlas), edit
the `DB_*` values — see the comments in `.env.example`. The `.env` file is
gitignored, so real credentials never get committed.

## To run with docker:

- Create the `.env` file as described above

- ```docker-compose up --build```

- Open http://localhost in your browser

This starts four containers: nginx (port 80), the backend (port 3000), the
react frontend (port 5173) and MongoDB (port 27017, data persisted in a
docker volume).

## To run locally: *<font color="red">(alternative to docker to allow for debugging locally)</font>*:

- Create the `.env` file as described above, and change `DB_HOST_SUFFIX` to
`localhost:27017` (or point it at your own MongoDB instance)

- Start a MongoDB instance, e.g. ```docker-compose up mongo``` or a local install

- Download *[nginx](http://nginx.org/en/download.html)* and extract it into a folder named *nginx/*

- Replace *nginx.conf* file in *nginx* folder with the one in *infra/nginx.conf* in the project

- In the *nginx.conf* file in *nginx* folder, change all paths labeled "root" with {path_to_project}\Briscola\briscola;

- In your *C:\Windows\System32\drivers\etc\hosts* file (open the file as an administrator), and add: 
</br>127.0.0.1 backend


- open a terminal and cd into the root directory run </br>
```npm install``` </br>
```node backend/backendloader.js```

- open a terminal and cd into the react/ directory run </br>
```npm install``` </br>
```node node_modules\vite\bin\vite.js```

- open a terminal and cd into your nginx/ directory run</br>
```start nginx```
