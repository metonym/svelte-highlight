export type PrismaPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const prismaPreviewSnippets: PrismaPreviewSnippet[] = [
  {
    title: "Datasource and generator",
    description: "datasource and generator blocks",
    code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}`,
  },
  {
    title: "Model fields",
    description: "scalar types, ?, [], and @attributes",
    code: `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())

  @@map("users")
}`,
  },
  {
    title: "Relations and enums",
    description: "@relation, @@index, and enum Role",
    code: `model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int

  @@index([authorId])
}

enum Role {
  USER
  ADMIN
}`,
  },
  {
    title: "Comments",
    description: "// line comments and /// doc comments",
    code: `// Core identity model
model User {
  id    Int    @id @default(autoincrement())
  email String @unique

  /// The user's display name, shown in the UI
  name String?
}`,
  },
];
