// Mock user database for authentication
export interface AuthUser {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const userDatabase: AuthUser[] = [
  {
    id: 'user-1',
    username: 'demo',
    password: 'password',
    email: 'demo@usc.edu',
    firstName: 'Demo',
    lastName: 'User',
  },
  {
    id: 'user-2',
    username: 'alexchen',
    password: 'trojan123',
    email: 'alexchen@usc.edu',
    firstName: 'Alex',
    lastName: 'Chen',
  },
  {
    id: 'user-3',
    username: 'jordan',
    password: 'jordan456',
    email: 'jmartinez@usc.edu',
    firstName: 'Jordan',
    lastName: 'Martinez',
  },
  {
    id: 'user-4',
    username: 'samtaylor',
    password: 'sam2024',
    email: 'staylor@usc.edu',
    firstName: 'Sam',
    lastName: 'Taylor',
  },
  {
    id: 'user-5',
    username: 'casey',
    password: 'film2025',
    email: 'cwong@usc.edu',
    firstName: 'Casey',
    lastName: 'Wong',
  },
  {
    id: 'user-6',
    username: 'riley',
    password: 'policy123',
    email: 'rjohnson@usc.edu',
    firstName: 'Riley',
    lastName: 'Johnson',
  },
];

export function authenticateUser(username: string, password: string): AuthUser | null {
  const user = userDatabase.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
}

export function registerUser(
  username: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string
): AuthUser {
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    username,
    password,
    email,
    firstName,
    lastName,
  };
  userDatabase.push(newUser);
  return newUser;
}
