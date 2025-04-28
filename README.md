## Getting Started
Event Alert - Frontend is the client application which uses the endpoints provided by [event-alert-backend](https://github.com/adrianscarlatescu/event-alert-backend).<br/> 
The technology stack consits of: TypeScript, Angular, Angular Material, @agm/core, @auth0/angular-jwt, HTML, CSS.

## Project scope
The purpose of this project is to demonstrate the usage of the endpoints provided by the [server application](https://github.com/adrianscarlatescu/event-alert-backend) and also to provide a unique UI and UX.
By using this application, a user can update his profile, report incidents in his area, check his incidents, search for incidents reported by others and much more.

## Run prerequisites
In order to run the application locally, the following steps must be set:
* Minimum software versions:
  * Node.js 16.13.0
  * npm 8.1.0

* A Google Maps API key must be generated and put in [main.module.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/app/main/main.module.ts#L48).
* If the server IP is different, it must be set in [environment.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/environments/environment.ts#L9).

## Video demonstration
The YouTube link is available [here](https://youtu.be/AutvBfRmnWM).
