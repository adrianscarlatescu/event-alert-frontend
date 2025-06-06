## Getting Started
Event Alert - Frontend is the client application which uses the endpoints provided by [event-alert-backend](https://github.com/adrianscarlatescu/event-alert-backend).<br/>
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
* Minimum software versions:
  * Node.js 16.13.0
  * npm 8.1.0

* A Google Maps API key must be generated and put in [main.module.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/app/main/main.module.ts#L48).
* If the server IP is different, it must be set in [environment.ts](https://github.com/adrianscarlatescu/event-alert-frontend/blob/master/src/environments/environment.ts#L9).

## Main features
Register, login, view/update profile
<table>
 <tr>
  <td><img src="src/assets/readme/capture_auth_register.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_auth_login.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_profile.png" width="auto"></td>
 </tr>
</table>

Filter and sort events by certain criteria
<table>
 <tr>
  <td><img src="src/assets/readme/capture_filter.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_order.png" width="auto"></td>
 </tr>
</table>

Filter result (map and list mode)
<table>
 <tr>
  <td><img src="src/assets/readme/capture_map.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_list.png" width="auto"></td>
 </tr>
</table>

View event marker info and check event details
<table>
 <tr>
  <td><img src="src/assets/readme/capture_map_marker.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_event_details.png" width="auto"></td>
 </tr>
</table>

View reported events and report new event
<table>
 <tr>
  <td><img src="src/assets/readme/capture_reporter.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_report_new_event.png" width="auto"></td>
 </tr>
</table>

Form validation across all pages
<table>
 <tr>
  <td><img src="src/assets/readme/capture_validation_filter.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_validation_report_new_event.png" width="auto"></td>
 </tr>
 <tr>
  <td><img src="src/assets/readme/capture_validation_profile.png" width="auto"></td>
 </tr>
</table>
