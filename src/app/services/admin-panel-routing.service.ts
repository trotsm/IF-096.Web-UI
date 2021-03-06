import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminPanelRoutingService {
  public iconActive: string; // icon for fourth section in header menu (after More menu)
  public nameActive: string; // name
  public pathActive: string; // path
  public active: boolean; // active route

  public routes = [ // array for static button links
    {
      path: '/admin-panel/students',
      icon: 'school',
      name: 'Учні'
    },
    {
      path: '/admin-panel/teachers',
      icon: 'person',
      name: 'Вчителі'
    }
  ];

  public routesMore = [ // array for button links on More menu
    {
      path: '/admin-panel/groups',
      icon: 'group_work',
      name: 'Класи'
    },
    {
      path: '/admin-panel/subjects',
      icon: 'library_books',
      name: 'Предмети'
    },
    {
      path: '/journals',
      icon: 'collections_bookmark',
      name: 'Журнали'
    },
    {
      path: '/admin-panel/schedule',
      icon: 'today',
      name: 'Розклад'
    },
    {
      path: '/admin-panel/teacher-connection',
      icon: 'person_add',
      name: 'Додати вчителя до журналу'
    },
    {
      path: '/admin-panel/new-year-transition',
      icon: 'queue',
      name: 'Новий навчальний рік'
    }
  ];

  constructor(private router: Router) {
  }

  /**
   * change third section in menu
   * depending on selected routing from More menu
   * show name, icon, route depending on selected section
   */
  activeRoute() {
    [this.pathActive, this.iconActive, this.nameActive] =
      [this.routesMore[0].path, this.routesMore[0].icon, this.routesMore[0].name]; // show Classes by default
    for (const i of Object.keys (this.routesMore)) { // link buttons from More menu
      if (this.router.url === this.routesMore[i].path) { // show path, icon, route depending on route path
        [this.pathActive, this.iconActive, this.nameActive] =
          [this.routesMore[i].path, this.routesMore[i].icon, this.truncateName(this.routesMore[i].name, 8)];
        this.active = true; // highlight section
      }
      if (this.router.url.slice(0, 15) === '/journals/class') { // show Journals for separate journal
        [this.pathActive, this.iconActive, this.nameActive] =
          [this.routesMore[2].path, this.routesMore[2].icon, this.routesMore[2].name];
        this.active = true; // highlight section
      }
    }
    for (const i in this.routes) { // link buttons from static menu
      if (this.router.url === this.routes[i].path || this.router.url === '/admin-panel') {
        this.active = false; // remove class for highlighting section in third section
      }
    }
    return {path: this.pathActive, icon: this.iconActive, name: this.nameActive, active: this.active};
  }

  /**
   * truncate name if it is longer than specified characters in header menu
   * @param name of route path
   * @param size of allowed characters
   * @returns name or truncated name (if it is too long)
   */
  truncateName(name, size): string {
    return name.length > size ? name.slice(0, size) + '…' : name;
  }
}
