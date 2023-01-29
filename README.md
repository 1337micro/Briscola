To play the game:
http://briscola.xyz/

To run with docker:

docker-compose build

docker-compose up

To run locally:

Download nginx

Replace nginx.conf with the one in infra/nginx.conf

In that nginx.conf, change all paths labeled "root" with the root directory of this project

start nginx

node backendloader.js
