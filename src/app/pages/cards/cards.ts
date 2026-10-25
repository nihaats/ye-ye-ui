import { Component } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { YeCard } from "../../shared/ye-card/ye-card";

@Component({
  imports: [YeCard, TranslocoPipe],
  selector: "app-cards",
  styleUrl: "./cards.scss",
  templateUrl: "./cards.html",
})
export class Cards {
  player = {
    firstName: "ALİ",
    lastName: "ÇELİK",
    position: "defender",
    rating: 84,
    number: 4,
    country: "tr",
    flag: "https://flagcdn.com/w80/tr.png",
    age: 19,
    height: "1.88",
    foot: "right",
    motto: "SAVUNMANIN KALESİ",
    serial: "07/25",
    photo:
      "https://i.namu.wiki/i/7LQSbf7m3vybzYSn_EffmgPXLIkLMdGb1C5d_tniONqQ76lpE_HYz9KMUykI8p9Wh-pIK1d4x2D1p2nE6Ubi_Q.webp",
  };

  stats = [
    { key: "pace", value: 82 },
    { key: "shooting", value: 60 },
    { key: "passing", value: 76 },
    { key: "dribbling", value: 72 },
    { key: "defending", value: 88 },
    { key: "physical", value: 90 },
  ];

  chromeFlipped = false;

  tilt(event: PointerEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  }

  resetTilt(event: PointerEvent) {
    const el = event.currentTarget as HTMLElement;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }
}
