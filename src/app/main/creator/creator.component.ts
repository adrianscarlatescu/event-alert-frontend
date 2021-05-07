import {Component, OnInit, ViewChild} from '@angular/core';
import {EventService} from '../../service/event.service';
import {DomSanitizer} from '@angular/platform-browser';
import {SessionService} from '../../service/session.service';
import {FileService} from '../../service/file.service';
import {Router} from '@angular/router';
import {Event} from '../../model/event';
import {ToastrService} from 'ngx-toastr';
import {MatTable} from '@angular/material/table';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  events: Event[] = [];
  displayedColumns: string[] = ['thumbnail', 'tag', 'severity', 'dateTime'];

  constructor(private eventService: EventService,
              private fileService: FileService,
              private sessionService: SessionService,
              private toast: ToastrService,
              private domSanitizer: DomSanitizer,
              private router: Router) {

  }

  ngOnInit(): void {
    this.eventService.getByUserId(this.sessionService.getUser().id)
      .subscribe(events => {
        this.events = events;
      });
  }


  onRowClicked(index: number) {
    this.router.navigate(['event/details'], {state: {id: this.events[index].id}});
  }

  onNewEventClicked() {
    if (!this.sessionService.getLatitude() || !this.sessionService.getLongitude()) {
      this.toast.warning('Location not provided');
      return;
    }
    this.router.navigate(['event/new'], {
      state:
        {
          latitude: this.sessionService.getLatitude(),
          longitude: this.sessionService.getLongitude()
        }
    });
  }

}
