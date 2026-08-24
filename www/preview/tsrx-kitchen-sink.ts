export const tsrxKitchenSink = `type User = {
  id: number;
  name: string;
  admin?: boolean;
  bio?: string;
};

interface Props {
  users: User[];
  title?: string;
}

// Lazy prop reads stay reactive.
export function Dashboard(&{ users, title }: Props) @{
  const heading = title ?? "Team";

  <>
    {/* One JSX tree is the function output; no return. */}
    <header class="banner">
      <h1>{heading}</h1>
      <Badge count={users.length} />
    </header>

    @for (const user of users) {
      // Setup before the row is still TypeScript.
      const role = user.admin ? "Admin" : "Member";

      <article class="user-row">
        <strong>{user.name}</strong>
        <span>{role}</span>
        @if (user.bio) {
          <p>{user.bio}</p>
        } @else {
          <p class="muted">No bio</p>
        }
      </article>
    } @empty {
      <p>No users yet</p>
    }

    @switch (users.length) {
      @case (0) {
        <p>Invite someone</p>
      }
      @default {
        <p>{users.length} on the roster</p>
      }
    }

    /* Stats can suspend; this is the fallback. */
    @try {
      <Stats users={users} />
    } @catch (error) {
      <p class="error">{error.message}</p>
    } @pending {
      <p>Loading stats</p>
    }

    <style>
      /* Scoped to this component. */
      .banner {
        padding: 1rem;
      }

      .user-row {
        display: flex;
        gap: 0.5rem;
      }

      .muted {
        color: #888;
      }

      .error {
        color: crimson;
      }
    </style>
  </>
}

function Badge({ count }: { count: number }) @{
  <span class="badge">{count}</span>
}

// Tuple form of the same lazy destructure.
function Pair(&[first, second]: [string, string]) @{
  <p>{first} / {second}</p>
}
`;
