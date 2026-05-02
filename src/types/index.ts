import { Timestamp } from 'firebase/firestore';

export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  onboarded: boolean;
  // Patient fields
  age?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  isSharingEnabled?: boolean;
  // Doctor fields
  degree?: string;
}

export type RecordType = 'prescription' | 'report';

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileURL: string;
  fileName: string;
  type: RecordType;
  createdAt: Timestamp;
}
