export type RpmspecPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const rpmspecPreviewSnippets: RpmspecPreviewSnippet[] = [
  {
    title: "A minimal package spec",
    description: "preamble tags, section headers, and macros",
    code: `Name: mypackage
Version: 1.0
Release: 1%{?dist}
Summary: An example package
License: MIT
BuildRequires: gcc

%description
This is an example package.

%prep
%autosetup

%build
%configure
%make_build

%install
%make_install

%files
%license LICENSE
%{_bindir}/mypackage

%changelog
* Mon Jan 01 2024 Jane Doe <jane@example.com> - 1.0-1
- Initial package
`,
  },
  {
    title: "Conditionals",
    description: "the %if/%endif preprocessor directives",
    code: `%if 0%{?fedora}
BuildRequires: fedora-only-package
%endif

%bcond_with tests`,
  },
  {
    title: "File attributes",
    description: "%doc, %config, and %dir in the files section",
    code: `%files
%doc README.md
%config(noreplace) %{_sysconfdir}/mypackage.conf
%dir %{_datadir}/mypackage`,
  },
];
