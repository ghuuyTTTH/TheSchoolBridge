
import { User, Session, Role } from '../types';

const USERS_KEY = 'sb_users';
const SESSION_KEY = 'sb_session';

export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    return JSON.parse(data) as User[];
  } catch (e) {
    console.error('Error parsing sb_users', e);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signUp = (
  name: string,
  email: string,
  password: string,
  role: Role,
  extraField: string
): { success: boolean; error?: string; user?: User } => {
  const trimmedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (users.some(u => u.email === trimmedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: trimmedEmail,
    passwordHash: btoa(trimmedEmail + ':' + password),
    role,
    studentId: role === 'student' ? extraField : null,
    schoolCode: role === 'teacher' ? extraField : null,
    childStudentId: role === 'parent' ? extraField : null,
    createdAt: Date.now(),
  };

  users.push(user);
  saveUsers(users);

  const session: Session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user };
};

export const signIn = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const trimmedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find(u => u.email === trimmedEmail);

  if (!user) {
    return { success: false, error: 'No account found with that email.' };
  }

  const hash = btoa(trimmedEmail + ':' + password);
  if (user.passwordHash !== hash) {
    return { success: false, error: 'Incorrect password.' };
  }

  const session: Session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user };
};

export const signOut = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): Session | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data) as Session;
    
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
};
