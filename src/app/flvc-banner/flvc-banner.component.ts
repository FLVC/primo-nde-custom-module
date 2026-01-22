import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'custom-flvc-banner',
  standalone: true,
  imports: [],
  templateUrl: './flvc-banner.component.html',
  styleUrl: './flvc-banner.component.scss'
})
export class FlvcBannerComponent implements OnInit {

  constructor(
    private httpService: HttpService,
    private renderer: Renderer2,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.bannerEnabled === "true";
    const institutionCode = this.moduleParameters.institutionCode;
 
    if (!enabled) {
      return;
    }

    const urls = [
      'https://alma-apps.flvc.org/primobanner/get.jsp?institution_code=' + institutionCode + '&ig=' + institutionCode,
      'https://alma-apps.flvc.org/primobanner/get.jsp?institution_code=NETWORK&ig=' + institutionCode,
    ];

    urls.forEach((url, index) => {
      this.httpService.getData(url).subscribe((data) => {
        const bannerText = data.trim();
        if (bannerText.length > 0) {
          const div = this.renderer.createElement('div');
          const className = index === 0 ? 'localbanner' : 'networkbanner';
          this.renderer.addClass(div, className);
          this.renderer.setStyle(div, 'background', '#ecd90f');
          this.renderer.setStyle(div, 'display', 'inline-block');
          this.renderer.setStyle(div, 'font-weight', 'bold');
          this.renderer.setStyle(div, 'padding', '10px');
          this.renderer.setStyle(div, 'text-align', 'center');
          this.renderer.setStyle(div, 'width', '100%');
          this.renderer.setProperty(div, 'innerHTML', bannerText);

          const body = document.body;
          this.renderer.insertBefore(body, div, body.firstChild);
        }
      });
    });
  }
}
