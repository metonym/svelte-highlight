export type MesonPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const mesonPreviewSnippets: MesonPreviewSnippet[] = [
  {
    title: "C library with tests",
    description:
      "project setup, a shared library, a dependency object, and tests",
    code: `project('libfoo', 'c',
  version : '0.4.2',
  license : 'MIT',
  meson_version : '>= 1.1.0',
  default_options : ['warning_level=3', 'c_std=c11'])

cc = meson.get_compiler('c')
m_dep = cc.find_library('m', required : false)
glib_dep = dependency('glib-2.0', version : '>= 2.66')

inc = include_directories('include')
libfoo = library('foo',
  'src/foo.c', 'src/parse.c',
  include_directories : inc,
  dependencies : [glib_dep, m_dep],
  version : meson.project_version(),
  install : true)

libfoo_dep = declare_dependency(
  include_directories : inc,
  link_with : libfoo)

install_headers('include/foo.h', subdir : 'foo')

if get_option('tests')
  foreach name : ['parse', 'roundtrip', 'errors']
    exe = executable('test-' + name, 'tests/@0@.c'.format(name),
      dependencies : libfoo_dep)
    test(name, exe, timeout : 30)
  endforeach
endif
`,
  },
  {
    title: "Platform checks and config header",
    description: "host_machine, configuration_data, and configure_file",
    code: `conf = configuration_data()
conf.set_quoted('PACKAGE_VERSION', meson.project_version())
conf.set('HAVE_EPOLL', cc.has_header('sys/epoll.h'))

# Pick the backend for this platform.
system = host_machine.system()
if system == 'windows'
  sources += files('src/backend_win32.c')
  conf.set('USE_WIN32', 1)
elif system in ['linux', 'android'] and not get_option('force_poll')
  sources += files('src/backend_epoll.c')
else
  sources += files('src/backend_poll.c')
endif

configure_file(
  output : 'config.h',
  configuration : conf)

summary({
  'backend' : system,
  'debug' : get_option('debug'),
}, section : 'Configuration', bool_yn : true)
`,
  },
  {
    title: "Generated sources and custom targets",
    description:
      "f-strings, multi-line strings, find_program, and custom_target",
    code: `python = find_program('python3')
gen = find_program('scripts/gen_tables.py')

tables = custom_target('tables',
  input : 'data/tables.json',
  output : ['tables.c', 'tables.h'],
  command : [gen, '@INPUT@', '--outdir', '@OUTDIR@'])

version_h = vcs_tag(
  input : 'version.h.in',
  output : 'version.h',
  fallback : f'@0@-dev'.format(meson.project_version()))

usage = '''Run the tool with:
  tool --input FILE
Options are documented in man/tool.1.'''

foreach key, value : {'small' : 0x10, 'large' : 0o400}
  message(f'size @key@ is @value@')
endforeach

subdir('docs')
`,
  },
];
