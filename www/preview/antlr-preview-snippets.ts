export type AntlrPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const antlrPreviewSnippets: AntlrPreviewSnippet[] = [
  {
    title: "JSON grammar",
    description: "a combined grammar with parser rules, fragments, and skip",
    code: `/** Taken from "The Definitive ANTLR 4 Reference" by Terence Parr */
grammar JSON;

json
    : value EOF
    ;

obj
    : '{' pair (',' pair)* '}'
    | '{' '}'
    ;

pair
    : STRING ':' value
    ;

arr
    : '[' value (',' value)* ']'
    | '[' ']'
    ;

value
    : STRING
    | NUMBER
    | obj
    | arr
    | 'true'
    | 'false'
    | 'null'
    ;

STRING
    : '"' (ESC | SAFECODEPOINT)* '"'
    ;

fragment ESC
    : '\\\\' (["\\\\/bfnrt] | UNICODE)
    ;

fragment UNICODE
    : 'u' HEX HEX HEX HEX
    ;

fragment HEX
    : [0-9a-fA-F]
    ;

fragment SAFECODEPOINT
    : ~ ["\\\\\\u0000-\\u001F]
    ;

NUMBER
    : '-'? INT ('.' [0-9]+)? EXP?
    ;

fragment INT
    : '0' | [1-9] [0-9]*
    ;

fragment EXP
    : [Ee] [+-]? [0-9]+
    ;

WS
    : [ \\t\\n\\r]+ -> skip
    ;
`,
  },
  {
    title: "Calculator with actions",
    description: "labels, alternative labels, precedence, and Java actions",
    code: `grammar LabeledExpr;

@header {
package calc;

import java.util.HashMap;
import java.util.Map;
}

@parser::members {
    Map<String, Integer> memory = new HashMap<String, Integer>();

    int eval(int left, int op, int right) {
        switch (op) {
            case MUL: return left * right;
            case DIV: return left / right;
            case ADD: return left + right;
            case SUB: return left - right;
        }
        return 0;
    }
}

prog
    : stat+
    ;

stat
    : expr NEWLINE                  # printExpr
    | ID '=' expr NEWLINE           # assign
    | NEWLINE                       # blank
    ;

expr
    : <assoc=right> expr '^' expr   # pow
    | left=expr op=('*'|'/') right=expr  # MulDiv
    | left=expr op=('+'|'-') right=expr  # AddSub
    | INT                           # int
    | ID                            # id
    | '(' expr ')'                  # parens
    ;

MUL : '*' ;
DIV : '/' ;
ADD : '+' ;
SUB : '-' ;
ID  : [a-zA-Z]+ ;
INT : [0-9]+ ;
NEWLINE : '\\r'? '\\n' ;
WS  : [ \\t]+ -> skip ;
`,
  },
  {
    title: "Lexer modes",
    description: "a split lexer grammar with channels, modes, and commands",
    code: `lexer grammar TemplateLexer;

options { caseInsensitive = false; }

channels { COMMENTS_CHANNEL }

tokens { VARIABLE }

// Text outside of tags.
TEXT        : ~[{]+ ;
OPEN_EXPR   : '{{' -> pushMode(EXPR) ;
OPEN_TAG    : '{%' -> pushMode(TAG), type(OPEN_EXPR) ;
COMMENT     : '{#' .*? '#}' -> channel(COMMENTS_CHANNEL) ;

mode EXPR;

CLOSE_EXPR  : '}}' -> popMode ;
PIPE        : '|' ;
DOT         : '.' ;
NAME        : [a-zA-Z_] [a-zA-Z_0-9]* -> type(VARIABLE) ;
EXPR_WS     : [ \\t\\r\\n]+ -> skip ;

mode TAG;

CLOSE_TAG   : '%}' -> popMode ;
KEYWORD     : 'if' | 'for' | 'end' ;
TAG_NAME    : [a-z]+ -> type(VARIABLE) ;
TAG_WS      : [ \\t\\r\\n]+ -> channel(HIDDEN) ;
`,
  },
  {
    title: "Split parser grammar",
    description: "a parser grammar with tokenVocab, arguments, and returns",
    code: `parser grammar TemplateParser;

options { tokenVocab = TemplateLexer; }

import CommonRules;

document
    : element* EOF
    ;

element
    : TEXT
    | expression[0]
    ;

expression[int depth] returns [String text]
locals [List<String> filters = new ArrayList<String>()]
@init { $text = ""; }
@after { System.out.println($text); }
    : OPEN_EXPR name=VARIABLE (PIPE filters+=VARIABLE)* CLOSE_EXPR
      { $text = $name.text; }
    ;
    catch [RecognitionException e] { reportError(e); }
`,
  },
];
