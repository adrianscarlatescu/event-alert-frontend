import {Component, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../service/session.service';
import {EventsMapComponent} from './events-map/events-map.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EventService} from '../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {OrderDialogComponent} from '../common/order/order-dialog.component';
import {EventsListComponent} from './events-list/events-list.component';
import {PageEvent} from '@angular/material/paginator';
import {EventsOrder} from '../../enums/events-order';
import {PAGE_SIZE} from '../../defaults/constants';
import {EventsFilterDto} from '../../model/events-filter.dto';
import {EventDto} from '../../model/event.dto';
import {FilterOptions} from '../../types/filter-options';
import {FilterDialogComponent} from '../common/filter/filter-dialog.component';
import {SpinnerService} from '../../service/spinner.service';
import {UserLocation} from '../../types/user-location';
import {HomePage} from '../../types/home-page';
import {TypeService} from '../../service/type.service';
import {SeverityService} from '../../service/severity.service';
import {StatusService} from '../../service/status.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild(EventsMapComponent) mapComponent: EventsMapComponent;
  @ViewChild(EventsListComponent) listComponent: EventsListComponent;

  totalEvents: number;
  totalPages: number;
  totalContentDisplayed: number;
  pageIndex: number;

  homePage: HomePage;

  events: EventDto[];

  filterOptions: FilterOptions;
  eventsFilter: EventsFilterDto;
  eventsOrder: EventsOrder;

  userLocation: UserLocation;

  constructor(private sessionService: SessionService,
              private eventService: EventService,
              private typeService: TypeService,
              private severityService: SeverityService,
              private statusService: StatusService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private dialog: MatDialog) {

    this.totalEvents = 0;
    this.totalPages = 0;
    this.totalContentDisplayed = 0;
    this.pageIndex = 0;

    this.eventsOrder = EventsOrder.BY_DATE_DESCENDING;

    const sessionHomePage = this.sessionService.getHomePage();
    this.homePage = sessionHomePage && sessionHomePage === HomePage.LIST ? HomePage.LIST : HomePage.MAP;
    this.sessionService.setHomePage(this.homePage);

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation()
      .subscribe(userLocation => this.userLocation = userLocation);

    forkJoin([
      this.typeService.getTypes(),
      this.severityService.getSeverities(),
      this.statusService.getStatuses()
    ])
      .subscribe(data => {
        this.filterOptions = {
          types: data[0],
          severities: data[1],
          statuses: data[2],

          radius: 1000,

          // Cover the events recorded in the database
          startDate: new Date(2020, 0, 1),
          endDate: new Date(2020, 11, 31)
        }
      });
  }

  onPreviousClicked(): void {
    if (this.totalPages <= 1) {
      return;
    }
    if (this.pageIndex === 0) {
      this.pageIndex = this.totalPages - 1;
    } else {
      this.pageIndex--;
    }
    this.requestNewSearch();
  }

  onLocationClicked(): void {
    if (!this.userLocation) {
      this.toast.warning('Location not provided');
      return;
    }
    this.mapComponent.setDefaultViewValues();
  }

  onNextClicked(): void {
    if (this.totalPages <= 1) {
      return;
    }
    if (this.pageIndex + 1 === this.totalPages) {
      this.pageIndex = 0;
    } else {
      this.pageIndex++;
    }
    this.requestNewSearch();
  }

  onFilterClicked(): void {
    if (!this.userLocation) {
      this.toast.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<FilterDialogComponent> = this.dialog.open(FilterDialogComponent, {
      data: this.filterOptions,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      const isNewSearch: boolean = dialogRef.componentInstance.isNewSearch;
      if (!isNewSearch) {
        return;
      }

      this.filterOptions = dialogRef.componentInstance.filterOptions;

      this.eventsFilter = {
        radius: this.filterOptions.radius,
        startDate: this.filterOptions.startDate,
        endDate: this.filterOptions.endDate,
        latitude: this.userLocation.latitude,
        longitude: this.userLocation.longitude,
        typeIds: this.filterOptions.types.map(type => type.id),
        severityIds: this.filterOptions.severities.map(severity => severity.id),
        statusIds: this.filterOptions.statuses.map(status => status.id)
      };

      this.pageIndex = 0;
      this.requestNewSearch();
    });
  }

  onPageSwitchClicked(): void {
    if (this.homePage == HomePage.MAP) {
      this.homePage = HomePage.LIST;
    } else if (this.homePage == HomePage.LIST) {
      this.homePage = HomePage.MAP;
    }

    this.sessionService.setHomePage(this.homePage);
  }

  onOrderClicked(): void {
    if (!this.userLocation) {
      this.toast.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<OrderDialogComponent> = this.dialog.open(OrderDialogComponent, {
      data: this.eventsOrder
    });

    dialogRef.afterClosed().subscribe(newOrder => {
      if (!newOrder || this.totalEvents === 0 || newOrder === this.eventsOrder) {
        this.toast.info('Order not applied');
        return;
      }
      this.eventsOrder = newOrder;
      this.pageIndex = 0;
      this.requestNewSearch();
    });
  }

  private requestNewSearch(): void {
    this.spinnerService.show();
    this.eventService.getEventsByFilter(this.eventsFilter, PAGE_SIZE, this.pageIndex, this.eventsOrder)
      .subscribe(page => {
        this.totalPages = page.totalPages;
        this.totalEvents = page.totalElements;
        this.totalContentDisplayed = page.content.length;
        this.events = page.content;

        if (this.totalEvents === 0) {
          this.toast.info('No events found');
        }

        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  onPageChanged(pageEvent: PageEvent): void {
    this.pageIndex = pageEvent.pageIndex;
    this.requestNewSearch();
  }

}
