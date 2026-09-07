export type PlsqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const plsqlPreviewSnippets: PlsqlPreviewSnippet[] = [
  {
    title: "A stored procedure",
    description: "%TYPE, exception handling, and the standalone slash",
    code: `CREATE OR REPLACE PROCEDURE raise_salary(p_id NUMBER) IS
  v_salary employees.salary%TYPE;
BEGIN
  SELECT salary INTO v_salary FROM employees WHERE id = p_id;
  v_salary := v_salary * 1.1;
  UPDATE employees SET salary = v_salary WHERE id = p_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20001, 'Employee not found');
END;
/
`,
  },
  {
    title: "Cursors and loops",
    description: "CURSOR, %FOUND, and a labeled loop",
    code: `DECLARE
  CURSOR emp_cur IS SELECT id, name FROM employees;
  v_id employees.id%TYPE;
  v_name employees.name%TYPE;
BEGIN
  OPEN emp_cur;
  <<fetch_loop>>
  LOOP
    FETCH emp_cur INTO v_id, v_name;
    EXIT WHEN emp_cur%NOTFOUND;
    DBMS_OUTPUT.PUT_LINE(v_name);
  END LOOP fetch_loop;
  CLOSE emp_cur;
END;
/
`,
  },
  {
    title: "Bind variables and quoted strings",
    description: ":bind variables and q'[...]' quoting",
    code: `SELECT NVL(:employee_name, 'Unknown') AS name
FROM dual
WHERE description = q'[O'Brien's report]';
`,
  },
];
