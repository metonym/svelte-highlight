export type JustPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const justPreviewSnippets: JustPreviewSnippet[] = [
  {
    title: "Build and test recipes",
    description: "recipe dependencies, variables, and default parameters",
    code: `# variables
target := env_var_or_default("TARGET", "release")

build target=target:
	cargo build --{{target}}

# run tests after building
test: build
	cargo test

# a function call as an inline parameter default
serve port=env_var_or_default("PORT", "8080"):
	python3 -m http.server {{port}}`,
  },
  {
    title: "Interpolation and attributes",
    description: "string interpolation, attributes, and shebang recipes",
    code: `[private]
[confirm]
deploy env="staging":
	echo "deploying to {{env}}"

[no-cd]
python-script:
	#!/usr/bin/env python3
	print("hello from just")`,
  },
  {
    title: "Modules, imports, and aliases",
    description: "export, set, import, mod, and alias keywords",
    code: `export DATABASE_URL := "postgres://localhost/dev"

set shell := ["bash", "-cu"]

import "shared.just"
mod docker

alias b := build

build:
	cargo build`,
  },
];
