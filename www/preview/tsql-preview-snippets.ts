export type TsqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const tsqlPreviewSnippets: TsqlPreviewSnippet[] = [
  {
    title: "Variables, hints, and a temp table",
    description: "@variables, @@globals, bracketed identifiers, and NOLOCK",
    code: `DECLARE @count INT;

SELECT TOP 10 [OrderId], N'note' AS Note
FROM #TempOrders WITH (NOLOCK)
WHERE CustomerId = @count AND @@ROWCOUNT > 0;
GO
`,
  },
  {
    title: "A stored procedure",
    description: "PROCEDURE, TRY/CATCH, and error handling",
    code: `CREATE PROCEDURE dbo.GetOrderTotal
    @orderId INT
AS
BEGIN
    BEGIN TRY
        SELECT SUM(LineTotal) AS Total
        FROM OrderLines
        WHERE OrderId = @orderId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
`,
  },
  {
    title: "Window functions and MERGE",
    description: "ROW_NUMBER, OVER/PARTITION BY, and MERGE",
    code: `SELECT
    CustomerId,
    ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC) AS rn
FROM Orders;

MERGE INTO Targets AS t
USING Sources AS s ON t.Id = s.Id
WHEN MATCHED THEN UPDATE SET t.Value = s.Value
WHEN NOT MATCHED THEN INSERT (Id, Value) VALUES (s.Id, s.Value);
`,
  },
];
