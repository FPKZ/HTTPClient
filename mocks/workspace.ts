import { User, Workspace } from "types";

const usersMock: (Omit<User, 'email'> & { email?: string })[] = [
    {
        id: '1',
        name: "Usuario 1",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+1'
    },
    {
        id: '2',
        name: "Usuario 2",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+2'
    },
    {
        id: '3',
        name: "Usuario 3",
        avatarUrl: ''
    },
    {
        id: '4',
        name: "Usuario 4",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+4'
    },
    {
        id: '5',
        name: "Usuario 5",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+5'
    },
    {
        id: '6',
        name: "Usuario 6",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+6'
    },
    {
        id: '7',
        name: "Usuario 7",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+7'
    },
    {
        id: '8',
        name: "Usuario 8",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+8'
    },
    {
        id: '9',
        name: "Usuario 9",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+9'
    },
    {
        id: '10',
        name: "Usuario 10",
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+10'
    },
]

const WorkspaceMock: Workspace[] = [
  {
    id: "1",
    name: "Backend Architecture",
    description: "Kubernetes, Node.js, and Redis microservices.",
    icon: "terminal",
    collectionsId: [],
    collectionsCount: 0,
    users: usersMock.slice(0, 5),
    updatedAt: "2026-07-03T16:00:00.000Z",
    ownerId: "1",
  },
  {
    id: "2",
    name: "Public API Gateway",
    description: "Internal documentation and proxy layer.",
    icon: "globe",
    collectionsId: [],
    collectionsCount: 0,
    users: usersMock,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    ownerId: "1",
  },
  {
    id: "3",
    name: "DevOps Dashboard",
    description: "Grafana and Prometheus visualization configs.",
    icon: "gauge",
    ownerId: "1",
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d atrás
    users: usersMock.slice(0, 4),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "4",
    name: "Workspace 4",
    description: "Workspace 4",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 2),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "5",
    name: "Workspace 5",
    description: "Workspace 5",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 3),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "6",
    name: "Workspace 6",
    description: "Workspace 6",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 1),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "7",
    name: "Workspace 7",
    description: "Workspace 7",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 6),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "8",
    name: "Workspace 8",
    description: "Workspace 8",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 2),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "9",
    name: "Workspace 9",
    description: "Workspace 9",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 4),
    collectionsCount: 0,
    collectionsId: [],
  },
  {
    id: "10",
    name: "Workspace 10",
    description: "Workspace 10",
    icon: "box",
    ownerId: "1",
    updatedAt: "2022-01-01",
    users: usersMock.slice(0, 5),
    collectionsCount: 0,
    collectionsId: [],
  }
];

export default WorkspaceMock;