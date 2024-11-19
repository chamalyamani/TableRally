#!/bin/bash

echo "Stopping all running containers..."
docker stop $(docker ps -q)

echo "Removing all stopped containers..."
docker container prune -f

echo "Removing dangling images..."
docker image prune -f

echo "Removing all unused volumes..."
docker volume prune -f

echo "Removing all unused networks..."
docker network prune -f

# echo "Stoping Postgresql db."
# sudo service postgresql stop

echo "\033[0;32mDocker cleanup completed.\033[0m"
