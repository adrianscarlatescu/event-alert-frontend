import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MainComponent} from './main.component';
import {HomeComponent} from './home/home.component';
import {ReporterComponent} from './reporter/reporter.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {ProfileComponent} from './profile/profile.component';
import {AdminComponent} from './admin/admin.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouteReuseStrategy, RouterModule} from '@angular/router';
import {AuthGuard} from '../service/guard/auth.guard';
import {SharedModule} from '../shared/shared.module';
import {AgmCoreModule} from '@agm/core';
import {AgmOverlays} from 'agm-overlays';
import {CustomReuseStrategy} from './common/custom.reuse.strategy';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {EventsMapComponent} from './home/map/events-map.component';
import {EventsListComponent} from './home/list/events-list.component';
import {FilterDialogComponent} from './common/filter/filter-dialog.component';
import {OrderDialogComponent} from './common/order/order-dialog.component';
import {EventReportDialogComponent} from './reporter/event-report/event-report-dialog.component';
import {EventDetailsComponent} from './common/event-details/event-details.component';
import {EventMapDialogComponent} from './common/event-details/map/event-map-dialog.component';
import {EventCommentDialogComponent} from './common/event-details/comment/event-comment-dialog.component';

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    EventsMapComponent,
    EventsListComponent,
    FilterDialogComponent,
    OrderDialogComponent,
    ReporterComponent,
    EventReportDialogComponent,
    NotificationsComponent,
    ProfileComponent,
    AdminComponent,
    EventDetailsComponent,
    EventMapDialogComponent,
    EventCommentDialogComponent
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
