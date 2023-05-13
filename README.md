# To play the game:
http://briscola.xyz/
</br>
## To run with docker:

- Ask for the .env file and add it to the project root

- ```docker-compose up --build```

## To run locally: *<font color="red">(alternative to docker to allow for debugging locally)</font>*:

- Ask for the *.env* file and add it to the project root

- Download *[nginx](http://nginx.org/en/download.html)* and extract it into a folder named *nginx/*

- Replace *nginx.conf* file in *nginx* folder with the one in *infra/nginx.conf* in the project

- In the *nginx.conf* file in *nginx* folder, change all paths labeled "root" with {path_to_project}\Briscola\briscola;

- In your *C:\Windows\System32\drivers\etc\hosts* file (open the file as an administrator), and add: 
</br>127.0.0.1 backend


- open a terminal and cd into the root directory run </br>
```npm install``` </br>
```node backend/backendloader.js```

- open a terminal and cd into your nginx/ directory run</br>
```start nginx```
