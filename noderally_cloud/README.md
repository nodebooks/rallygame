# The Server

The server application will follow the microservice architecture principles. It shall implement some services and a front-end (load balancer).

To run the server, one shall install Docker Host on the host machine and run services with `docker-compose build && docker-compose up` commands. Enjoy!

### Initialization

One shall install Docker Host on the host machine. Create an *attachable* overlay network for node rally.

```shell
docker network create -d overlay --attachable noderallynetwork

# Make sure that the network was created
docker network ls
```