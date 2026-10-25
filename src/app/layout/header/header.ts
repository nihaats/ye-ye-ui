import { afterNextRender, Component, DestroyRef, ElementRef, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-header",
  styleUrl: "./header.scss",
  templateUrl: "./header.html",
})
export class Header {
  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new ResizeObserver(() =>
        document.documentElement.style.setProperty("--header-height", `${host.offsetHeight}px`),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
