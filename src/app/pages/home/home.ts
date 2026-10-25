import { afterNextRender, Component, DestroyRef, inject, signal } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { YeCard } from "../../shared/ye-card/ye-card";
@Component({
  imports: [YeCard, TranslocoPipe],
  selector: "app-home",
  styleUrl: "./home.scss",
  templateUrl: "./home.html",
})
export class Home {
  banners = [
    { src: "assets/banner/football1.png", alt: "branches.football" },
    { src: "assets/banner/basketball1.png", alt: "branches.basketball" },
    { src: "assets/banner/swimming1.png", alt: "branches.swimming" },
  ];

  active = signal(0);

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => this.start());
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  next() {
    this.goTo(this.active() + 1);
  }

  prev() {
    this.goTo(this.active() - 1);
  }

  goTo(index: number) {
    const count = this.banners.length;
    this.active.set((index + count) % count);
    this.start();
  }

  private start() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.active.update((i) => (i + 1) % this.banners.length), 5000);
  }
}
