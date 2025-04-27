import {Component, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../service/session.service';
import {EventsMapComponent} from './map/events-map.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EventService} from '../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {OrderDialogComponent} from '../common/order/order-dialog.component';
import {EventsListComponent} from './list/events-list.component';
import {PageEvent} from '@angular/material/paginator';
import {PAGE_SIZE} from '../../defaults/constants';
import {FilterDto} from '../../model/filter.dto';
import {EventDto} from '../../model/event.dto';
import {FilterOptions} from '../../types/filter-options';
import {FilterDialogComponent} from '../common/filter/filter-dialog.component';
import {SpinnerService} from '../../service/spinner.service';
import {UserLocation} from '../../types/user-location';
import {HomePage} from '../../enums/home-page';
import {OrderId} from '../../enums/id/order-id';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild(EventsMapComponent) mapComponent: EventsMapComponent;
  @ViewChild(EventsListComponent) listComponent: EventsListComponent;

  totalEvents: number;
  totalEventsDisplayed: number;
  totalPages: number;
  pageIndex: number;

  homePage: HomePage;

  events: EventDto[];

  filterOptions: FilterOptions;
  filter: FilterDto;
  orderId: OrderId;

  userLocation: UserLocation;

  constructor(private sessionService: SessionService,
              private eventService: EventService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private dialog: MatDialog) {

    this.totalEvents = 0;
    this.totalEventsDisplayed = 0;
    this.totalPages = 0;
    this.pageIndex = 0;

    this.orderId = OrderId.BY_DATE_DESCENDING;

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation()
      .subscribe(userLocation => this.userLocation = userLocation);

    const sessionHomePage = this.sessionService.getHomePage();
    this.homePage = sessionHomePage && sessionHomePage === HomePage.LIST ? HomePage.LIST : HomePage.MAP;

    this.filterOptions = {
      typeIds: this.sessionService.getTypes().map(type => type.id),
      severityIds: this.sessionService.getSeverities().map(severity => severity.id),
      statusIds: this.sessionService.getStatuses().map(status => status.id),

      radius: 1000,

      // Cover the events recorded in the database
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2020, 11, 31)
    }
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
      this.toastrService.warning('Location not provided');
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
      this.toastrService.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<FilterDialogComponent> = this.dialog.open(FilterDialogComponent, {
      data: this.filterOptions,
      autoFocus: false
    });

    dialogRef.componentInstance.onValidate.subscribe(filterOptions => {
      dialogRef.componentInstance.close();

      this.filterOptions = filterOptions;

      this.filter = {
        radius: this.filterOptions.radius,
        startDate: this.filterOptions.startDate,
        endDate: this.filterOptions.endDate,
        latitude: this.userLocation.latitude,
        longitude: this.userLocation.longitude,
        typeIds: this.filterOptions.typeIds,
        severityIds: this.filterOptions.severityIds,
        statusIds: this.filterOptions.statusIds
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
      this.toastrService.warning('Location not provided');
      return;
    }

    const dialogRef: MatDialogRef<OrderDialogComponent> = this.dialog.open(OrderDialogComponent, {
      data: this.orderId,
    });

    dialogRef.componentInstance.onValidate.subscribe(newOrder => {
      dialogRef.componentInstance.close();
      if (newOrder === this.orderId) {
        return;
      }

      this.orderId = newOrder;

      if (this.totalEvents > 1) {
        this.pageIndex = 0;
        this.requestNewSearch();
      } else {
        this.toastrService.info('Order not applied');
      }
    });
  }

  private requestNewSearch(): void {
    this.spinnerService.show();
    this.eventService.getEventsByFilter(this.filter, PAGE_SIZE, this.pageIndex, this.orderId)
      .subscribe(page => {
        this.totalEvents = page.totalElements;
        this.totalEventsDisplayed = page.content.length;
        this.totalPages = page.totalPages;
        this.events = page.content;

        if (this.totalEvents === 0) {
          this.toastrService.info('No events found');
        }

        this.spinnerService.close();
      }, () => this.spinnerService.close());
  }

  onPageChanged(pageEvent: PageEvent): void {
    this.pageIndex = pageEvent.pageIndex;
    this.requestNewSearch();
  }

}
