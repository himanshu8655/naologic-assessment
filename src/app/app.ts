import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Timeline } from './components/timeline/timeline';

@Component({
  selector: 'app-root',
  imports: [Timeline, NgSelectModule, FormsModule],
 templateUrl: './app.html',
  styles: [`
    :host {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .top-nav {
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    flex-shrink: 0;
    background: #fff;
    border-bottom: 1px solid #E5E7EB;
  }
  .logo {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #111827;
    font-family: "Circular-Std", sans-serif;
  }
  .logo-nao { color: #3B5BDB; }
  `]
})
export class App {
  protected readonly title = signal('naologic-assessment');
}
