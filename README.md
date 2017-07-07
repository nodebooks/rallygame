# Noderally

Source codes for the multiplayer rally game

## The Story

We want to take the old classic Slicks 'n' Slide rally to this millennium. The game itself will be much like the original Slicks 'n' Slide, but we will also add some containerized backend and multiplayer features. The backend will be containerized with Docker and run in Docker Swarm.

### The Architecture

The prototype

```
 [UE4 client] <-------> [ microtasker & game ] 
```

Final deployment

```
 [UE4 client] <-------> [NGINX] <-------> [ SWARM / microservices ] 
```

The backend will be implemented mostly in JavaScript (Node.js). The client is implemented in C++ and using Unreal Engine 4 -suite. As always, we are happy to communicate with you guys, so feel free to send some email to us at nodebooks@gmail.com

Cheers,
 - AG & JV