import { Component, Inject } from '@angular/core';

@Component({
  selector: 'custom-flvc-test',
  standalone: true,
  imports: [],
  templateUrl: './flvc-test.component.html',
  styleUrl: './flvc-test.component.scss'
})
export class FlvcTestComponent {
  public data: any
  
  constructor(
      
      @Inject('MODULE_PARAMETERS') public moduleParameters: any
    ) { }

   ngOnInit(): void {
    console.log('Module parameters FlvcBannerComponent:', this.moduleParameters);
    const enabled = this.moduleParameters.testEnabled === "true";
    const institutionCode = this.moduleParameters.institutionCode;

    if (enabled) {
      this.data = institutionCode + " flvc-test works!";
    }
  }
}