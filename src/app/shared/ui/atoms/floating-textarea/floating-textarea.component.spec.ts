import { TestBed } from '@angular/core/testing';
import { FloatingTextareaComponent } from './floating-textarea.component';

describe('FloatingTextareaComponent: icono condicional', () => {
  it('presenta la X únicamente cuando hay valor y conserva el texto', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.componentRef.setInput('clearable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fa-times')).toBeNull();
    fixture.componentInstance.writeValue('Café Mixto');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fa-times')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('textarea').value).toBe('Café Mixto');
    fixture.componentInstance.writeValue('');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fa-times')).toBeNull();
  });
});
