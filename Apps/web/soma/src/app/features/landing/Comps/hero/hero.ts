import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSparkles, LucidePlay, LucideArrowRight} from '@lucide/angular';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, LucideSparkles, LucidePlay, LucideArrowRight],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {}
