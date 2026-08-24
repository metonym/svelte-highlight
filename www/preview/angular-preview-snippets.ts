export type AngularPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const angularPreviewSnippets: AngularPreviewSnippet[] = [
  {
    title: "Built-in control flow",
    description: "@if / @else and interpolation",
    code: `@if (user) {
  <p>Hello, {{ user.name }}</p>
} @else {
  <p>Guest</p>
}`,
  },
  {
    title: "@for and @defer",
    description: "list rendering with track, plus deferred loading",
    code: `@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <p>No items</p>
}

@defer {
  <heavy-chart />
} @placeholder {
  <p>Loading chart</p>
}`,
  },
  {
    title: "Directives and bindings",
    description: "*ngIf, two-way bind, events, property bind, template ref",
    code: `<input
  *ngIf="visible"
  [(ngModel)]="name"
  (click)="save()"
  [class.active]="focused"
  #field
/>`,
  },
];
