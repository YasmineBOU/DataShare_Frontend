import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';
import { Event, NavigationEnd, provideRouter } from '@angular/router';
import { throwError } from 'rxjs/internal/observable/throwError';
import { of, Subject } from 'rxjs';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isMobile based on device type', () => {
      // Mock window.innerWidth for mobile device
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      component.ngOnInit();
      expect(component.isMobile).toBe(true);

      // Mock window.innerWidth for desktop device
      window.innerWidth = 1200;
      component.ngOnInit();
      expect(component.isMobile).toBe(false);
    });
    
    it('should update currentRoute on route change', () => {
      const routerEvents = component['router'].events as Subject<Event>;
      routerEvents.next(new NavigationEnd(1, '/dashboard', '/dashboard') as Event);
      expect(component.currentRoute).toBe('/dashboard');
    });
  });

  describe('isUploadPage', () => {
    it('should return true for upload page routes', () => {
      component.currentRoute = '/files/upload';
      expect(component.isUploadPage).toBe(true);

      component.currentRoute = '/';
      expect(component.isUploadPage).toBe(true);
    });

    it('should return false for non-upload page routes', () => {
      component.currentRoute = '/files/download';
      expect(component.isUploadPage).toBe(false);
    });
  });

  describe('isDownloadPage', () => {
    it('should return true for download page routes', () => {
      component.currentRoute = '/files/download';
      expect(component.isDownloadPage).toBe(true);
    });

    it('should return false for non-download page routes', () => {
      component.currentRoute = '/files/upload';
      expect(component.isDownloadPage).toBe(false);
    });
  });

  describe('isDashboardPage', () => {
    it('should return true for dashboard page routes', () => {
      component.currentRoute = '/dashboard';
      expect(component.isDashboardPage).toBe(true);

      component.currentRoute = '/dashboard/settings';
      expect(component.isDashboardPage).toBe(true);
    });

    it('should return false for non-dashboard page routes', () => {
      component.currentRoute = '/files/upload';
      expect(component.isDashboardPage).toBe(false);
    });  
  });

  describe('toggleProfileMenu', () => {
    it('should toggle profileMenuOpen state', () => {
      component.profileMenuOpen = false;

      component.toggleProfileMenu();
      expect(component.profileMenuOpen).toBe(true);
      
      component.toggleProfileMenu();
      expect(component.profileMenuOpen).toBe(false);
    });
  });

  describe('logout', () => {

    let routerNavigateSpy: jest.SpyInstance;
    let authServiceLogoutSpy: jest.SpyInstance;
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    beforeEach(() => {
      routerNavigateSpy = jest.spyOn(component['router'], 'navigate').mockResolvedValue(true);
    });

    it('should call authService.logout and navigate to "/login" on success', () => {
      authServiceLogoutSpy = jest.spyOn(component['authService'], 'logout').mockReturnValue(of({}));
      component.logout();

      expect(authServiceLogoutSpy).toHaveBeenCalled();
      expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should alert error message on logout failure', () => {
      authServiceLogoutSpy = jest.spyOn(component['authService'], 'logout').mockReturnValue(throwError(() => ({ message: 'Logout failed' })));
      
      component.logout();

      expect(alertSpy).toHaveBeenCalledWith('Logout failed. Please try again.');
      expect(routerNavigateSpy).not.toHaveBeenCalled();
    });
  });
});
