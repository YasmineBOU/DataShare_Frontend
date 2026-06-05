import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSidebar } from './dashboard-sidebar';
import { provideRouter } from '@angular/router';

describe('DashboardSidebar', () => {
  let component: DashboardSidebar;
  let fixture: ComponentFixture<DashboardSidebar>;

  const mobileWidth = 500;
  const desktopWidth = 1200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isMobile to true and open sidebar on mobile devices', () => {
      // Mock window.innerWidth to simulate a mobile device
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: mobileWidth });
      
      component.ngOnInit();
      
      expect(component.isMobile).toBe(true);
      expect(component.isSidebarOpen).toBe(true);
    });

    it('should set isMobile to false and open sidebar on non-mobile devices', () => {
      // Mock window.innerWidth to simulate a non-mobile device
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: desktopWidth });
      
      component.ngOnInit();
      
      expect(component.isMobile).toBe(false);
      expect(component.isSidebarOpen).toBe(true);
    });
   });

   describe('toggleSidebar', () => {
     it('should toggle the state of isSidebarOpen', () => {
       component.isSidebarOpen = false;
       
       component.toggleSidebar();
       expect(component.isSidebarOpen).toBe(true);
       
       component.toggleSidebar();
       expect(component.isSidebarOpen).toBe(false);
     });
   });

   describe('checkIfMobile', () => {
     it('should set isMobile to true and open sidebar on mobile devices', () => {
       // Mock window.innerWidth to simulate a mobile device
       Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: mobileWidth });
       
       component['checkIfMobile']();
       
       expect(component.isMobile).toBe(true);
       expect(component.isSidebarOpen).toBe(true);
     });

     it('should set isMobile to false and open sidebar on non-mobile devices', () => {
       // Mock window.innerWidth to simulate a non-mobile device
       Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: desktopWidth });
       
       component['checkIfMobile']();
       
       expect(component.isMobile).toBe(false);
       expect(component.isSidebarOpen).toBe(true);
     });
    });
});
