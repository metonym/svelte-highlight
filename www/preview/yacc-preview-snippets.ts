export type YaccPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const yaccPreviewSnippets: YaccPreviewSnippet[] = [
  {
    title: "Infix calculator",
    description: "a prologue, precedence declarations, rules, and an epilogue",
    code: `/* Infix notation calculator. */

%{
  #include <math.h>
  #include <stdio.h>
  int yylex (void);
  void yyerror (char const *);
%}

%define api.value.type {double}
%token NUM
%left '-' '+'
%left '*' '/'
%precedence NEG   /* negation--unary minus */
%right '^'        /* exponentiation */

%%

input:
  %empty
| input line
;

line:
  '\\n'
| exp '\\n'  { printf ("\\t%.10g\\n", $1); }
;

exp:
  NUM
| exp '+' exp        { $$ = $1 + $3;      }
| exp '-' exp        { $$ = $1 - $3;      }
| exp '*' exp        { $$ = $1 * $3;      }
| exp '/' exp        { $$ = $1 / $3;      }
| '-' exp  %prec NEG { $$ = -$2;          }
| exp '^' exp        { $$ = pow ($1, $3); }
| '(' exp ')'        { $$ = $2;           }
;

%%

void
yyerror (char const *s)
{
  fprintf (stderr, "%s\\n", s);
}`,
  },
  {
    title: "Typed values and locations",
    description: "a %union, <type> tags, named references, and @ locations",
    code: `%locations
%define parse.error verbose

%union {
  int ival;
  char *sval;
  struct node *node;
}

%token <ival> INT
%token <sval> IDENT "identifier"
%token LET "let" IN "in"
%nterm <node> expr binding

%destructor { free ($$); } <sval>
%printer { fprintf (yyo, "%d", $$); } <ival>

%%

expr[result]:
  INT                 { $result = mk_int ($1); }
| IDENT               { $result = mk_var ($1, @1.first_line); }
| "let" binding "in" expr[body]
                      { $result = mk_let ($binding, $body); }
| error               { $result = NULL; yyerrok; }
;

binding:
  IDENT '=' expr      {
      if (lookup ($1) != NULL) {
        yyerror ("duplicate binding");
        YYERROR;
      }
      $$ = mk_bind ($1, $3);
    }
;`,
  },
  {
    title: "Bison C++ parser",
    description: "%code blocks, %define variables, and %param",
    code: `%require "3.8"
%language "c++"
%skeleton "lalr1.cc"
%header

%define api.token.raw
%define api.token.constructor
%define api.value.type variant
%define parse.assert

%code requires {
  #include <string>
  class driver;
}

%param { driver& drv }

%code {
  #include "driver.hh"
}

%define api.token.prefix {TOK_}
%token
  ASSIGN  ":="
  MINUS   "-"
  PLUS    "+"
  LPAREN  "("
  RPAREN  ")"
;

%token <std::string> IDENTIFIER "identifier"
%token <int> NUMBER "number"
%nterm <int> exp

%printer { yyo << $$; } <*>;

%%
%start unit;
unit: assignments exp  { drv.result = $2; };

assignments:
  %empty                 {}
| assignments assignment {};

assignment:
  "identifier" ":=" exp { drv.variables[$1] = $3; };

%left "+" "-";
exp:
  "number"
| "identifier"  { $$ = drv.variables[$1]; }
| exp "+" exp   { $$ = $1 + $3; }
| exp "-" exp   { $$ = $1 - $3; }
| "(" exp ")"   { std::swap ($$, $2); }
%%

void
yy::parser::error (const location_type& l, const std::string& m)
{
  std::cerr << l << ": " << m << '\\n';
}`,
  },
];
