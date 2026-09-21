export type GnuplotPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gnuplotPreviewSnippets: GnuplotPreviewSnippet[] = [
  {
    title: "Plotting a function",
    description: "a classic sine/cosine comparison with labeled axes",
    code: `set terminal pngcairo size 800,600
set output 'waves.png'
set title "Sine and Cosine"
set xlabel "x"
set ylabel "f(x)"
set grid
set xrange [-pi:pi]
set key top right

plot sin(x) title "sin(x)" with lines lw 2, \\
     cos(x) title "cos(x)" with lines lw 2 dashtype 2
`,
  },
  {
    title: "Plotting columns from a data file",
    description: "reading two series out of a whitespace-separated file",
    code: `set terminal svg
set output 'temps.svg'
set title 'Daily Temperatures'
set xlabel 'Day'
set ylabel 'Degrees C'
set style data linespoints
set key outside

plot 'temps.dat' using 1:2 title 'High' lw 2, \\
     'temps.dat' using 1:3 title 'Low' lw 2
`,
  },
  {
    title: "Inline datablock with a macro",
    description: "gnuplot 5+ datablocks and macro expansion for reuse",
    code: `set macros
STYLE = "with linespoints pt 7 ps 1.5"

$Samples << EOD
1 2.1
2 3.4
3 2.9
4 4.2
EOD

set title "Inline Data"
plot $Samples using 1:2 @STYLE title 'measured'
`,
  },
];
