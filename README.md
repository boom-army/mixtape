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

## Helius delegation 

Minting is currently done via the Helius API. Season 1 NFTs were standard programmable NFTs. The new Helius NFTs are compressed so need a different collection id, and any subsequent season will need a new collection id. The Season 2 collection is currently configured with delegate to the Helius account using `scripts/nft-tools.ts` so it can mint NFTs to the collection. Delegation can also be revoked using this command tool.
