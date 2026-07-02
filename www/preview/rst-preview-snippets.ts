export type RstPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const rstPreviewSnippets: RstPreviewSnippet[] = [
  {
    title: "Sphinx documentation page",
    description: "section titles, directives, and inline roles",
    code: `Fibonacci Sequence
===================

This module computes the *Fibonacci sequence* using **dynamic programming**.

.. code-block:: python

   def fib(n):
       a, b = 0, 1
       for _ in range(n):
           a, b = b, a + b
       return a

See :func:\`fib\` for the implementation, or read more at
\`Wikipedia <https://en.wikipedia.org/wiki/Fibonacci_sequence>\`_.

.. note::

   This implementation runs in O(n) time and O(1) space.`,
  },
  {
    title: "Docstring with field list",
    description: "param/type/returns fields, bullet lists, and literals",
    code: `Compute the nth Fibonacci number.

:param n: index into the sequence, zero-based
:type n: int
:returns: the nth Fibonacci number
:rtype: int
:raises ValueError: if n is negative

Example usage:

- Call with \`\`n=0\`\` to get the first number
- Call with \`\`n=10\`\` to get the eleventh number

.. warning::

   Large values of n may overflow.`,
  },
  {
    title: "Lists and substitutions",
    description:
      "numbered/bulleted lists, substitutions, and hyperlink targets",
    code: `Installation
============

Requirements:

1. Python |python_version| or newer
#. A virtual environment
#. pip installed

.. |python_version| replace:: 3.10

Steps:

* Create a virtual environment
* Activate it
* Run \`\`pip install mymodule\`\`

.. _mymodule: https://pypi.org/project/mymodule/`,
  },
];
