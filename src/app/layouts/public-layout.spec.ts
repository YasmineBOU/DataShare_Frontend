import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicLayout } from './public-layout';
import { provideRouter } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Event } from '@angular/router';

describe('PublicLayout', () => {
  let component: PublicLayout;
  let fixture: ComponentFixture<PublicLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set year to current year', () => {
    expect(component.year).toBe(new Date().getFullYear());
  });

  describe('showFooter', () => {
    it('should show footer by default', () => {
      expect(component.showFooter).toBe(true);
    });

    it('should hide footer on dashboard routes', () => {
      const routerEvents = component['router'].events as Subject<Event>;
      routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard') as Event);
      expect(component.showFooter).toBe(false);
    });

    it('should hide footer on dashboard sub-routes', () => {
      const routerEvents = component['router'].events as Subject<Event>;
      routerEvents.next(new NavigationEnd(1, '/dashboard/settings', '/dashboard/settings') as Event);
      expect(component.showFooter).toBe(false);
    });

    it('should show footer on non-dashboard routes', () => {
      const routerEvents = component['router'].events as Subject<Event>;
      routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard') as Event);
      expect(component.showFooter).toBe(false);

      routerEvents.next(new NavigationEnd(2, '/login', '/login') as Event);
      expect(component.showFooter).toBe(true);
    });
  });
});