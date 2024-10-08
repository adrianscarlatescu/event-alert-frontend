import {Component, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../../service/session.service';
import {MapComponent} from './map/map.component';
import {FilterOptions} from './filter/filter.options';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FilterDialogComponent} from './filter/filter-dialog.component';
import {EventService} from '../../service/event.service';
import {ToastrService} from 'ngx-toastr';
import {OrderDialogComponent} from '../common/order/order.dialog.component';
import {ListComponent} from './list/list.component';
import {PageEvent} from '@angular/material/paginator';
import {SpinnerService} from '../../shared/spinner/spinner.service';
import {Order} from '../../enums/order';
import {EventFilterRequest} from '../../model/request/event.filter.request';
import {PAGE_SIZE} from '../../defaults/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild(MapComponent) mapComponent: MapComponent;
  @ViewChild(ListComponent) listComponent: ListComponent;

  totalEvents: number;
  totalPages: number;
  pageIndex: number;

  homePage: HomePage;

  filterOptions: FilterOptions;
  filterRequest: EventFilterRequest;
  order: Order;

  constructor(private eventService: EventService,
              private sessionService: SessionService,
              private spinnerService: SpinnerService,
              private toast: ToastrService,
              private dialog: MatDialog) {

    this.filterOptions = new FilterOptions();
    this.filterOptions.tags = this.sessionService.getTags();
    this.filterOptions.severities = this.sessionService.getSeverities();

    this.filterRequest = new EventFilterRequest();

    this.totalEvents = 0;
    this.totalPages = 0;
    this.pageIndex = 0;

    this.order = Order.BY_DATE_DESCENDING;

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
      this.filterRequest.radius = this.filterOptions.radius;
      this.filterRequest.startDate = this.filterOptions.startDate;
      this.filterRequest.endDate = this.filterOptions.endDate;
      this.filterRequest.latitude = this.sessionService.getUserLatitude();
      this.filterRequest.longitude = this.sessionService.getUserLongitude();
      this.filterRequest.tagsIds = this.filterOptions.tags.map(tag => tag.id);
      this.filterRequest.severitiesIds = this.filterOptions.severities.map(severity => severity.id);

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
      data: this.order
    });

    dialogRef.afterClosed().subscribe(newOrder => {
      if (!newOrder || this.totalEvents === 0 || newOrder === this.order) {
        this.toast.info('Order not applied');
        return;
      }
      this.order = newOrder;
      this.pageIndex = 0;
      this.requestNewSearch();
    });
  }

  private requestNewSearch(): void {
    this.spinnerService.show();
    this.mapComponent.selectedEvent = undefined;
    this.eventService.getEventsByFilter(this.filterRequest, PAGE_SIZE, this.pageIndex, this.order)
      .subscribe(page => {
        this.totalPages = page.totalPages;
        this.totalEvents = page.totalElements;

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
