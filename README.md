## Getting Started
Event Alert - Frontend is the client application which uses the endpoints provided by [event-alert-backend](https://github.com/adrianscarlatescu/event-alert-backend).
The technology stack consits of:
* [TypeScript](https://www.typescriptlang.org/) - The programming language used to develop the JavaScript side.
* [Angular](https://angular.io/docs) - The framework used to develop the web components, manage routing, perform client-server communication and more.
* [Angular Material](https://material.angular.io/) - UI components included in the web pages.
* [@agm/core](https://www.npmjs.com/package/@agm/core) - The library that provides the required features for map interaction.
* [@auth0/angular-jwt](https://www.npmjs.com/package/@auth0/angular-jwt) - The library that decodes the JWTs.
* [HTML](https://en.wikipedia.org/wiki/HTML) - The markup language used to display the components in a web browser.
* [CSS](https://en.wikipedia.org/wiki/CSS) - The style sheet language used to design the components.

## Project scope
The purpose of this project is to demonstrate the usage of the endpoints provided by the [server application](https://github.com/adrianscarlatescu/event-alert-backend) and also to provide a unique UI and UX.
By using this application, a user can update his profile, report incidents in his area, check his incidents, search for incidents reported by others and much more.

## Run prerequisites
In order to run the application locally, the following steps must be set:
* A Google Maps API key must be generated and put in [main.module.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/app/main/main.module.ts#L31).
* If the server IP is different, it must be set in [environment.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/environments/environment.ts#L9).

## Video demonstration
The YouTube link is available [here](https://youtu.be/AutvBfRmnWM).
