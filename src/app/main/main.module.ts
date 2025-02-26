import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeComponent} from './home/home.component';
import {ReporterComponent} from './reporter/reporter.component';
import {AdminComponent} from './admin/admin.component';
import {ProfileComponent} from './profile/profile.component';
import {MainComponent} from './main.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouteReuseStrategy, RouterModule} from '@angular/router';
import {AuthGuard} from '../service/guard/auth.guard';
import {SharedModule} from '../shared/shared.module';
import {AgmCoreModule} from '@agm/core';
import {AgmOverlays} from 'agm-overlays';
import {EventsMapComponent} from './home/events-map/events-map.component';
import {EventsListComponent} from './home/events-list/events-list.component';
import {CustomReuseStrategy} from './common/custom.reuse.strategy';
import {NotificationsComponent} from './notifications/notifications.component';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {NewEventDialogComponent} from './reporter/new-event/new-event-dialog.component';
import {EventDetailsComponent} from './common/event-details/event-details.component';
import {EventCommentDialogComponent} from './common/event-comment/event-comment-dialog.component';
import {EventMapDialogComponent} from './common/event-map/event-map-dialog.component';
import {EventsFilterDialogComponent} from './common/events-filter/events-filter-dialog.component';
import {EventsOrderDialogComponent} from './common/events-order/events-order-dialog.component';

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    EventsMapComponent,
    EventsListComponent,
    EventsFilterDialogComponent,
    EventsOrderDialogComponent,
    ReporterComponent,
    NotificationsComponent,
    ProfileComponent,
    AdminComponent,
    NewEventDialogComponent,
    EventDetailsComponent,
    EventCommentDialogComponent,
    EventMapDialogComponent
  ],
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: 'GOOGLE_API_KEY'
    }),
    AgmOverlays,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '', component: MainComponent, canActivate: [AuthGuard],
        children: [
          {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
          {path: 'reporter', component: ReporterComponent, canActivate: [AuthGuard]},
          {path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard]},
          {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
          {path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
          {path: '', redirectTo: 'home', pathMatch: 'full'},

          {path: 'event/:id', component: EventDetailsComponent, canActivate: [AuthGuard]}
        ]
      }
    ])],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
  ]
})

export class MainModule {
}
