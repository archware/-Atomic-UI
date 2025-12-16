import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', active: true },
    { label: 'Pacientes', icon: 'fa-solid fa-hospital-user', active: false },
    { label: 'Resultados', icon: 'fa-solid fa-microscope', active: false },
    { label: 'Configuración', icon: 'fa-solid fa-gear', active: false }
  ];

  onItemClick(item: any) {
    this.menuItems.forEach(i => i.active = false);
    item.active = true;
    this.navigate.emit();
  }
}
