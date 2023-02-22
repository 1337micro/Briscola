**To play the game:**
http://briscola.xyz/

**To run with docker:**

Ask for the .env file and add it to the project root

docker-compose up --build

**To run locally:** (alternative to docker to allow for debugging locally):

Ask for the .env file and add it to the project root

Download nginx

Replace nginx.conf with the one in infra/nginx.conf

In that nginx.conf, change all paths labeled "root" with the root directory of this project on your system

In your C:\Windows\System32\drivers\etc\hosts file, add: ***127.0.0.1 backend***

npm install

start nginx

node backendloader.js
