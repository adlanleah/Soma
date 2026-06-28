import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  label: string
  href: string
}

interface NavGroup {
  heading: string
  links: NavLink[]
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class footer {
  readonly currentYear = new Date().getFullYear();

  readonly navGroups = signal([
    {
      heading: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Demo', href: '/demo' },
        { label: 'Changelog', href: '/changelog' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Help Center', href: '/help' },
        { label: 'Blog', href: '/blog' },
        { label: 'Webinars', href: '/webinars' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ])
}