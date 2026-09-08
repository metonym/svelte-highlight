export type BladePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bladePreviewSnippets: BladePreviewSnippet[] = [
  {
    title: "Conditionals and loops",
    description: "@if / @foreach directives mixed with embedded HTML",
    code: `@if($user->isAdmin())
  <p>{{ $user->name }} is an admin.</p>
@endif
@foreach($items as $item)
  <li>{{ $item->label }}</li>
@endforeach`,
  },
  {
    title: "PHP block and comments",
    description: "@php ... @endphp with a Blade comment",
    code: `@php
  $total = $subtotal + $tax;
@endphp
{{-- shown only when the cart has items --}}
@unless(empty($cart))
  <span>Total: {{ $total }}</span>
@endunless`,
  },
  {
    title: "Layout inheritance",
    description: "@extends, @section, and unescaped output",
    code: `@extends('layouts.app')

@section('content')
  <h1>{{ $title }}</h1>
  {!! $rawHtml !!}
@endsection`,
  },
];
