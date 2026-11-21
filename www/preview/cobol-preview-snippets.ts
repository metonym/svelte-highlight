export type CobolPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cobolPreviewSnippets: CobolPreviewSnippet[] = [
  {
    title: "Hello world",
    description: "fixed form with sequence numbers and a column-7 comment",
    code: `000100 IDENTIFICATION DIVISION.
000200 PROGRAM-ID. HELLO.
000300 AUTHOR. GRACE-HOPPER.
000400*  Prints a greeting and exits.
000500 PROCEDURE DIVISION.
000600     DISPLAY "Hello, world!".
000700     STOP RUN.`,
  },
  {
    title: "Sequential file report",
    description: "FD, record layout, and a read loop",
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CUSTRPT.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT CUSTOMER-FILE ASSIGN TO "CUSTOMERS.DAT"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-FILE-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD  CUSTOMER-FILE.
       01  CUSTOMER-RECORD.
           05 CUST-ID          PIC 9(6).
           05 CUST-NAME        PIC X(30).
           05 CUST-BALANCE     PIC S9(7)V99.

       WORKING-STORAGE SECTION.
       01  WS-FILE-STATUS      PIC XX.
       01  WS-EOF              PIC X VALUE "N".
           88 END-OF-FILE      VALUE "Y".
       01  WS-TOTAL            PIC S9(9)V99 COMP-3 VALUE ZERO.
       01  WS-TOTAL-OUT        PIC -ZZZ,ZZZ,ZZ9.99.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN INPUT CUSTOMER-FILE
           PERFORM UNTIL END-OF-FILE
               READ CUSTOMER-FILE
                   AT END SET END-OF-FILE TO TRUE
                   NOT AT END ADD CUST-BALANCE TO WS-TOTAL
               END-READ
           END-PERFORM
           CLOSE CUSTOMER-FILE
           MOVE WS-TOTAL TO WS-TOTAL-OUT
           DISPLAY "Total balance: " WS-TOTAL-OUT
           GOBACK.`,
  },
  {
    title: "Payroll paragraphs",
    description: "numbered paragraphs, EVALUATE, and COMPUTE",
    code: `       PROCEDURE DIVISION.
       0000-MAIN.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-CALCULATE-PAY
               VARYING WS-IDX FROM 1 BY 1
               UNTIL WS-IDX > WS-EMPLOYEE-COUNT
           PERFORM 9000-FINALIZE
           STOP RUN.

       2000-CALCULATE-PAY.
           EVALUATE TRUE
               WHEN EMP-HOURS(WS-IDX) > 40
                   COMPUTE WS-GROSS ROUNDED =
                       40 * EMP-RATE(WS-IDX)
                       + (EMP-HOURS(WS-IDX) - 40) * EMP-RATE(WS-IDX) * 1.5
               WHEN OTHER
                   COMPUTE WS-GROSS ROUNDED =
                       EMP-HOURS(WS-IDX) * EMP-RATE(WS-IDX)
           END-EVALUATE
           ADD WS-GROSS TO WS-PAYROLL-TOTAL.`,
  },
  {
    title: "Free-form source",
    description: "COBOL 2002 free format with *> comments and intrinsics",
    code: `*> Free-format source: no sequence or indicator area.
IDENTIFICATION DIVISION.
PROGRAM-ID. today.

DATA DIVISION.
WORKING-STORAGE SECTION.
01 ws-now      PIC X(21).
01 ws-name     PIC X(20) VALUE "world".

PROCEDURE DIVISION.
    MOVE FUNCTION CURRENT-DATE TO ws-now  *> YYYYMMDDhhmmss...
    DISPLAY "Hello, " FUNCTION TRIM(ws-name) "! It is " ws-now(1:8)
    GOBACK.`,
  },
];
