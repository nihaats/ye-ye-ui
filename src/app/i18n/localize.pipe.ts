import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslocoService } from "@jsverse/transloco";

/** Uygulama içi yola aktif dil ön ekini ekler: '/login' -> '/tr/login' */
@Pipe({ name: "localize", pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

  transform(path: string) {
    return `/${this.transloco.getActiveLang()}${path === "/" ? "" : path}`;
  }
}
