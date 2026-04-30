import { Component, inject, Inject, Input, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'custom-widget-loader',
  standalone: true,
  imports: [],
  templateUrl: './widget-loader.component.html',
  styleUrl: './widget-loader.component.scss'
})
export class WidgetLoaderComponent implements OnInit {

  @Input() private hostComponent!: any;

  constructor(
    private renderer: Renderer2,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private scripts: ScriptLoaderService,
    private zone: NgZone,
  ) { }

  async ngOnInit(): Promise<void> {
    const enabled = this.moduleParameters.widgetLoaderEnabled === "true";
    const widgetLoaderScript = this.moduleParameters.widgetLoaderScript;
    const widgetLoaderDivId = this.moduleParameters.widgetLoaderDivId;
    const widgetLoaderDivClass = this.moduleParameters.widgetLoaderDivClass;
    const widgetLoaderDivValue = this.moduleParameters.widgetLoaderDivValue;

    if (!enabled) {
      return;
    }

    if (widgetLoaderDivId != undefined || widgetLoaderDivClass != undefined) {
      const div = this.renderer.createElement('div');
      if (widgetLoaderDivId != undefined) {
        this.renderer.setAttribute(div, "id", widgetLoaderDivId);
      }
      if (widgetLoaderDivClass != undefined) {
        this.renderer.addClass(div, widgetLoaderDivClass);
      }
      if (widgetLoaderDivValue != undefined) {
        this.renderer.setProperty(div, 'innerHTML', widgetLoaderDivValue);
      }

      const body = document.body;
      this.renderer.insertBefore(body, div, body.lastChild);
    }

    await this.zone.runOutsideAngular(() =>
      this.scripts.load(
        widgetLoaderScript,
        {
          defer: true,
          async: true,
        }
      )
    );
  }
}
