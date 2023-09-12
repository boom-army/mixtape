### local build docker
- `DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose build`
- `docker build . --platform=linux/amd64 -t mixtape/p1`
- `docker push mixtape/p1`

### server process

- `sudo nano /etc/nginx/sites-available/default`
- `sudo systemctl reload nginx`
- `sudo docker pull mixtape/p1`
- `sudo docker stop $(sudo docker ps -a -q)`
- `sudo docker run -p 3000:3000 -d mixtape/p1`
- `sudo docker run -it --rm mixtape/p1`
- `sudo docker exec -it 4ce067c36d09 /bin/bash`

## DB hosting

At https://app.bitlaunch.io/login
ssh -i ~/.ssh/id_ed25519_3zy root@64.225.32.119
