export type PlantumlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const plantumlPreviewSnippets: PlantumlPreviewSnippet[] = [
  {
    title: "A basic sequence diagram",
    description: "actors, participants, and message arrows",
    code: `@startuml
' a simple sequence diagram
actor User
participant "Web Server" as Web
database DB

User -> Web : request page
Web --> DB : query
DB --> Web : rows
Web --> User : 200 OK

note right of Web #lightblue
  cache miss
end note
@enduml
`,
  },
  {
    title: "A class diagram",
    description: "classes, interfaces, and relationship arrows",
    code: `@startuml
interface Shape {
  +area(): double
}

class Circle <<final>> {
  -radius: double
  +area(): double
}

class Square {
  -side: double
  +area(): double
}

Shape <|.. Circle
Shape <|.. Square
@enduml
`,
  },
  {
    title: "A state diagram",
    description: "state markers and transitions",
    code: `@startuml
[*] --> Idle
Idle --> Running : start
Running --> Paused : pause
Paused --> Running : resume
Running --> [*] : stop
@enduml
`,
  },
];
