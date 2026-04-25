
import { User, Session, Role } from '../types';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => doc.data() as User);
};

export const signUp = async (
  name: string,
  email: string,
  password: string,
  role: Role,
  extraField: string
): Promise<{ success: boolean; error?: string; user?: User }> => {
  const trimmedEmail = email.trim().toLowerCase();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const firebaseUser = userCredential.user;

    const user: User = {
      id: firebaseUser.uid,
      name,
      email: trimmedEmail,
      passwordHash: '', // Not needed with Firebase Auth
      role,
      studentId: role === 'student' ? extraField : null,
      schoolCode: role === 'teacher' ? extraField : null,
      childStudentId: role === 'parent' ? extraField : null,
      createdAt: Date.now(),
      classes: [],
    };

    await setDoc(doc(db, 'users', user.id), user);

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
  const trimmedEmail = email.trim().toLowerCase();
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const firebaseUser = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      return { success: false, error: 'User data not found.' };
    }

    return { success: true, user: userDoc.data() as User };
  } catch (error: any) {
    return { success: false, error: 'Invalid email or password.' };
  }
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  return userDoc.exists() ? (userDoc.data() as User) : null;
};
