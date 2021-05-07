import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeComponent} from './home/home.component';
import {CreatorComponent} from './creator/creator.component';
import {AdminComponent} from './admin/admin.component';
import {ProfileComponent} from './profile/profile.component';
import {MainComponent} from './main.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouteReuseStrategy, RouterModule} from '@angular/router';
import {AuthGuard} from '../service/guard/auth.guard';
import {SharedModule} from '../shared/shared.module';
import {AgmCoreModule} from '@agm/core';
import {EventDetailsComponent} from './common/event/details/event.details.component';
import {AgmOverlays} from 'agm-overlays';
import {CommentDialogComponent} from './common/event/comment/comment.dialog.component';
import {NewEventComponent} from './creator/new/new.event.component';
import {MapComponent} from './home/map/map.component';
import {ListComponent} from './home/list/list.component';
import {FilterDialogComponent} from './home/filter/filter.dialog.component';
import {OrderDialogComponent} from './common/order/order.dialog.component';
import {CustomReuseStrategy} from './common/custom.reuse.strategy';


@NgModule({
  declarations: [MainComponent, HomeComponent, CreatorComponent, AdminComponent, ProfileComponent, EventDetailsComponent, CommentDialogComponent, NewEventComponent, MapComponent, ListComponent, FilterDialogComponent, OrderDialogComponent],
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
          {path: 'creator', component: CreatorComponent, canActivate: [AuthGuard]},
          {path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
          {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
          {path: '', redirectTo: 'home', pathMatch: 'full'},

          {path: 'event/details', component: EventDetailsComponent, canActivate: [AuthGuard]},
          {path: 'event/new', component: NewEventComponent, canActivate: [AuthGuard]}
        ]
      }
    ])],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
  ]
})

export class MainModule {
}
