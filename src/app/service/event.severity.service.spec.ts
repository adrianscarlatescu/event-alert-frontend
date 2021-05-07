import {TestBed} from '@angular/core/testing';

import {EventSeverityService} from './event.severity.service';

describe('EventSeverityService', () => {
  let service: EventSeverityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventSeverityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
