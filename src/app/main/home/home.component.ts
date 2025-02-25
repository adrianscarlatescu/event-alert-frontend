import {Component, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../service/session.service';
import {EventsMapComponent} from './map/events-map.component';
import {FilterOptions} from './filter/filter.options';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FilterDialogComponent} from './filter/filter-dialog.component';
import {EventService} from '../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {OrderDialogComponent} from '../common/order/order-dialog.component';
import {EventsListComponent} from './list/events-list.component';
import {PageEvent} from '@angular/material/paginator';
import {SpinnerService} from '../../shared/spinner/spinner.service';
import {OrderCode} from '../../enums/order-code';
import {PAGE_SIZE} from '../../defaults/constants';
import {EventFilterDto} from '../../model/event-filter.dto';

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

  filterOptions: FilterOptions;
  eventFilter: EventFilterDto;
  orderCode: OrderCode;

  constructor(private eventService: EventService,
              private sessionService: SessionService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private dialog: MatDialog) {

    this.filterOptions = {
      radius: 1000,
      types: this.sessionService.getTypes(),
      severities: this.sessionService.getSeverities(),
      statuses: this.sessionService.getStatuses(),

      // Cover the events recorded in the database
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2020, 11, 31)
    }

    this.totalEvents = 0;
    this.totalPages = 0;
    this.totalContentDisplayed = 0;
    this.pageIndex = 0;

    this.orderCode = OrderCode.BY_DATE_DESCENDING;

    const storageHomePage: string = this.sessionService.getHomePage();
    this.homePage = storageHomePage == 'list' ? HomePage.LIST : HomePage.MAP;

  }

  ngOnInit(): void {

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

      this.eventFilter = {
        radius: this.filterOptions.radius,
        startDate: this.filterOptions.startDate,
        endDate: this.filterOptions.endDate,
        latitude: this.sessionService.getUserLatitude(),
        longitude: this.sessionService.getUserLongitude(),
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
    const dialogRef: MatDialogRef<OrderDialogComponent> = this.dialog.open(OrderDialogComponent, {
      data: this.orderCode
    });

    dialogRef.afterClosed().subscribe(newOrder => {
      if (!newOrder || this.totalEvents === 0 || newOrder === this.orderCode) {
        this.toast.info('Order not applied');
        return;
      }
      this.orderCode = newOrder;
      this.pageIndex = 0;
      this.requestNewSearch();
    });
  }

  private requestNewSearch(): void {
    this.spinnerService.show();
    this.mapComponent.selectedEvent = undefined;
    this.eventService.getEventsByFilter(this.eventFilter, PAGE_SIZE, this.pageIndex, this.orderCode)
      .subscribe(page => {
        this.totalPages = page.totalPages;
        this.totalEvents = page.totalElements;
        this.totalContentDisplayed = page.content.length;

        this.mapComponent.setEvents(page.content);
        this.listComponent.setData(page.content, page.totalElements, this.pageIndex);

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

export enum HomePage {
  MAP = 'map', LIST = 'list'
}
