import { TestBed } from '@angular/core/testing';

import { HttpGameServiceService } from './http-game-service.service';

describe('HttpGameServiceService', () => {
  let service: HttpGameServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpGameServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
