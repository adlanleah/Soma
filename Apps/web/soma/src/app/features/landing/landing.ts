import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hero } from "./Comps/hero/hero";
import { Features } from '../features';
import { HowItWorks } from './Comps/how-it-works/how-it-works';
import { Roles } from './Comps/roles/roles';
import { footer } from './Comps/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Hero, Features, Roles, HowItWorks, footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}
