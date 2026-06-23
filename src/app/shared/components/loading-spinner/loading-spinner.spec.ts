import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinner } from './loading-spinner';
import { CommonModule } from '@angular/common';

describe('LoadingSpinner', () => {
  let component: LoadingSpinner;
  let fixture: ComponentFixture<LoadingSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, LoadingSpinner],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default message', () => {
    const messageElement = fixture.nativeElement.querySelector('.text-lg');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent?.trim()).toBe('Chargement en cours...');
  });

  it('should display a custom message', () => {
    fixture.componentRef.setInput('message', 'Veuillez patienter...');
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('.text-lg');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent?.trim()).toBe('Veuillez patienter...');
  });

  it('should hide the spinner when showSpinner is false', () => {
    fixture.componentRef.setInput('showSpinner', false);
    fixture.detectChanges(); 

    const spinnerElement = fixture.nativeElement.querySelector('svg');
    expect(spinnerElement).toBeNull();
  });

  it('should show the spinner by default', () => {
    const spinnerElement = fixture.nativeElement.querySelector('svg');
    expect(spinnerElement).toBeTruthy();
  });
});
