export type LexPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const lexPreviewSnippets: LexPreviewSnippet[] = [
  {
    title: "Word count",
    description: "the three sections, a %{ %} block, and C actions",
    code: `%{
#include <stdio.h>

int chars = 0;
int words = 0;
int lines = 0;
%}

%option noyywrap

%%

[a-zA-Z]+   { words++; chars += yyleng; }
\\n          { chars++; lines++; }
.           { chars++; }

%%

int main(void)
{
  yylex();
  printf("%8d%8d%8d\\n", lines, words, chars);
  return 0;
}`,
  },
  {
    title: "Pascal-like scanner",
    description: "named definitions, {NAME} references, and ECHO",
    code: `/* scanner for a toy Pascal-like language */

%{
#include <math.h>
%}

DIGIT    [0-9]
ID       [a-z][a-z0-9]*

%%

{DIGIT}+    {
            printf( "An integer: %s (%d)\\n", yytext,
                    atoi( yytext ) );
            }

{DIGIT}+"."{DIGIT}*        {
            printf( "A float: %s (%g)\\n", yytext,
                    atof( yytext ) );
            }

if|then|begin|end|procedure|function        {
            printf( "A keyword: %s\\n", yytext );
            }

{ID}        printf( "An identifier: %s\\n", yytext );

"+"|"-"|"*"|"/"   printf( "An operator: %s\\n", yytext );

"{"[^}\\n]*"}"     /* eat up one-line comments */

[ \\t\\n]+          /* eat up whitespace */

.           printf( "Unrecognized character: %s\\n", yytext );

%%

int main( int argc, char **argv )
{
    ++argv, --argc;  /* skip over program name */
    if ( argc > 0 )
            yyin = fopen( argv[0], "r" );
    else
            yyin = stdin;

    yylex();
}`,
  },
  {
    title: "Start conditions",
    description: "%x states, <STATE> prefixes, scopes, BEGIN, and <<EOF>>",
    code: `%option noyywrap yylineno nodefault
%option prefix="json"
%x STR COMMENT

%{
#include "json.tab.h"
static char buf[1024];
static char *p;
%}

%%

"/*"                BEGIN(COMMENT);
<COMMENT>{
  "*/"              BEGIN(INITIAL);
  [^*\\n]+           /* skip */
  "*"               /* skip */
  \\n                /* yylineno counts it */
}

\\"                  { p = buf; BEGIN(STR); }
<STR>{
  \\"                { *p = '\\0'; yylval.str = strdup(buf);
                      BEGIN(INITIAL); return STRING; }
  \\\\n               *p++ = '\\n';
  \\\\\\"              *p++ = '"';
  [^\\\\"\\n]+         { memcpy(p, yytext, yyleng); p += yyleng; }
  <<EOF>>           { yyerror("unterminated string"); yyterminate(); }
}

-?[0-9]+("."[0-9]+)?  { yylval.num = atof(yytext); return NUMBER; }
"true"              return TRUE;
"false"             return FALSE;
"null"              return NULL_TOK;
[{}\\[\\]:,]           return yytext[0];
[ \\t\\r\\n]+          ;
.                   { fprintf(stderr, "line %d: bad char '%c'\\n",
                              yylineno, yytext[0]); }`,
  },
];
