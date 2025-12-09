import { User, Memorial, MemorialAccess, Photo, Role, MemorialWithRole } from '../types';

// Initial Mock Data
const MOCK_ADMIN: User = { id: 'admin-1', email: 'admin@magnimoments.com', name: 'Super Admin', isSuperAdmin: true };
const MOCK_USER_JANE: User = { id: 'user-1', email: 'jane@family.com', name: 'Jane Doe' };
const MOCK_USER_MIKE: User = { id: 'user-2', email: 'mike@family.com', name: 'Mike Doe' };

const STORAGE_KEY = 'magnimoments_db_v1';

interface DB {
  users: User[];
  memorials: Memorial[];
  access: MemorialAccess[];
  photos: Photo[];
}

const loadDB = (): DB => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  // Seed data
  const initialDB: DB = {
    users: [MOCK_ADMIN, MOCK_USER_JANE, MOCK_USER_MIKE],
    memorials: [],
    access: [],
    photos: []
  };
  
  // Seed a sample memorial
  const sampleMemorial: Memorial = {
    id: 'mem-1',
    slug: 'john-doe',
    fullName: 'Johnathan Doe',
    birthDate: '1945-03-12',
    deathDate: '2023-11-05',
    bio: 'A loving father, grandfather, and dedicated community servant. John loved gardening and jazz music.',
    createdAt: Date.now(),
    coverPhotoUrl: 'https://picsum.photos/800/400'
  };
  
  initialDB.memorials.push(sampleMemorial);
  // Jane is owner
  initialDB.access.push({ userId: MOCK_USER_JANE.id, memorialId: sampleMemorial.id, role: Role.OWNER });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// --- Auth Services ---

export const login = async (email: string): Promise<User | null> => {
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  // For demo: if admin email, return admin. If not found, auto-signup for simplicity in demo
  if (!user && email === 'admin@magnimoments.com') return MOCK_ADMIN;
  if (user) return user;
  
  // Auto-signup for demo
  const newUser: User = { id: `user-${Date.now()}`, email, name: email.split('@')[0] };
  db.users.push(newUser);
  saveDB(db);
  return newUser;
};

// --- Memorial Services (Protected by RLS Logic) ---

export const getAccessibleMemorials = async (currentUser: User): Promise<MemorialWithRole[]> => {
  const db = loadDB();
  
  if (currentUser.isSuperAdmin) {
    // Admin sees all, but technically "Access" role might not be explicitly set in table for them. 
    // We will return all with a virtual 'SUPER_ADMIN' role.
    return db.memorials.map(m => ({
      ...m,
      currentUserRole: Role.SUPER_ADMIN
    }));
  }

  // RLS: Join memorials on access table where userId matches
  const myAccess = db.access.filter(a => a.userId === currentUser.id);
  
  const results: MemorialWithRole[] = [];
  for (const acc of myAccess) {
    const mem = db.memorials.find(m => m.id === acc.memorialId);
    if (mem) {
      results.push({ ...mem, currentUserRole: acc.role });
    }
  }
  return results;
};

export const getMemorialById = async (memorialId: string, currentUser: User): Promise<MemorialWithRole | null> => {
  const db = loadDB();
  const mem = db.memorials.find(m => m.id === memorialId);
  if (!mem) return null;

  if (currentUser.isSuperAdmin) {
    return { ...mem, currentUserRole: Role.SUPER_ADMIN };
  }

  const access = db.access.find(a => a.memorialId === memorialId && a.userId === currentUser.id);
  if (!access) {
    // SECURITY: Reject access if no record found
    throw new Error("Access Denied: You do not have permission to view this memorial.");
  }

  return { ...mem, currentUserRole: access.role };
};

export const createMemorial = async (currentUser: User, data: Omit<Memorial, 'id' | 'createdAt'>, ownerEmail: string): Promise<Memorial> => {
  if (!currentUser.isSuperAdmin) throw new Error("Only Admins can create memorials.");
  
  const db = loadDB();
  const newMemorial: Memorial = {
    ...data,
    id: `mem-${Date.now()}`,
    createdAt: Date.now(),
    // Default mock cover if none provided
    coverPhotoUrl: data.coverPhotoUrl || `https://picsum.photos/seed/${Date.now()}/800/400`
  };

  db.memorials.push(newMemorial);

  // Assign Owner
  const owner = db.users.find(u => u.email === ownerEmail);
  if (owner) {
    db.access.push({ userId: owner.id, memorialId: newMemorial.id, role: Role.OWNER });
  } else {
    // Invite flow stub: Create placeholder user or store pending invite. 
    // For this demo, we'll create the user immediately.
    const newOwner: User = { id: `user-${Date.now()}`, email: ownerEmail, name: ownerEmail.split('@')[0] };
    db.users.push(newOwner);
    db.access.push({ userId: newOwner.id, memorialId: newMemorial.id, role: Role.OWNER });
  }

  saveDB(db);
  return newMemorial;
};

export const updateMemorialBio = async (memorialId: string, bio: string, currentUser: User) => {
  const db = loadDB();
  // Check RLS
  const access = db.access.find(a => a.memorialId === memorialId && a.userId === currentUser.id);
  if (!currentUser.isSuperAdmin && (!access || access.role === Role.CONTRIBUTOR)) {
    throw new Error("Permission Denied: Only Owners can edit details.");
  }
  
  const idx = db.memorials.findIndex(m => m.id === memorialId);
  if (idx !== -1) {
    db.memorials[idx].bio = bio;
    saveDB(db);
  }
};

export const inviteContributor = async (memorialId: string, email: string, currentUser: User) => {
  const db = loadDB();
   // Check RLS
  const access = db.access.find(a => a.memorialId === memorialId && a.userId === currentUser.id);
  if (!currentUser.isSuperAdmin && (!access || access.role !== Role.OWNER)) {
    throw new Error("Permission Denied: Only Owners can invite contributors.");
  }

  // Find or create user
  let user = db.users.find(u => u.email === email);
  if (!user) {
    user = { id: `user-${Date.now()}`, email, name: email.split('@')[0] };
    db.users.push(user);
  }

  // Check if already has access
  const existingAccess = db.access.find(a => a.memorialId === memorialId && a.userId === user!.id);
  if (!existingAccess) {
    db.access.push({ userId: user.id, memorialId, role: Role.CONTRIBUTOR });
  }

  saveDB(db);
};

// --- Photo Services ---

export const getPhotos = async (memorialId: string, currentUser: User): Promise<Photo[]> => {
  // Implicitly protected by the parent page load check, but good to check access again for robustness
  const db = loadDB();
  // We assume the caller has already verified page access, but in a real API we would verify token access to memorialId
  return db.photos.filter(p => p.memorialId === memorialId).sort((a, b) => b.createdAt - a.createdAt);
};

export const addPhoto = async (memorialId: string, url: string, caption: string, tags: string[], currentUser: User): Promise<Photo> => {
  const db = loadDB();
  const access = db.access.find(a => a.memorialId === memorialId && a.userId === currentUser.id);
  if (!currentUser.isSuperAdmin && !access) throw new Error("Access Denied");

  const newPhoto: Photo = {
    id: `ph-${Date.now()}`,
    memorialId,
    uploaderId: currentUser.id,
    url,
    caption,
    tags,
    createdAt: Date.now()
  };

  db.photos.push(newPhoto);
  saveDB(db);
  return newPhoto;
};
