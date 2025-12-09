export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export interface User {
  id: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean; // In a real app, this might be a role claim
}

export interface Memorial {
  id: string;
  slug: string; // Friendly URL part
  fullName: string;
  birthDate: string;
  deathDate: string;
  bio: string;
  coverPhotoUrl?: string;
  createdAt: number;
}

export interface MemorialAccess {
  userId: string;
  memorialId: string;
  role: Role;
}

export interface Photo {
  id: string;
  memorialId: string;
  uploaderId: string;
  url: string;
  caption?: string;
  tags?: string[]; // AI generated tags
  createdAt: number;
}

// Helper type for the dashboard
export interface MemorialWithRole extends Memorial {
  currentUserRole: Role;
}