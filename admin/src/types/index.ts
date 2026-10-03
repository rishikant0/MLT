export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  coursePreference?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: string;
  fileUrl: string;
  previewUrl?: string;
  fileSize?: string;
  isSample: boolean;
  status: string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code?: string;
  description?: string;
  fee: number;
  status: string;
  materials?: Material[];
}

export interface Semester {
  id: string;
  courseId: string;
  name: string;
  semesterNumber: number;
  fee: number;
  order: number;
  status: string;
  subjects?: Subject[];
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  eligibility: string;
  careerOps?: string;
  thumbnail?: string;
  status: string;
  semesters?: Semester[];
}

export interface Pricing {
  id: string;
  entityType: string;
  entityId: string;
  price: number;
  offerPrice?: number;
  discountPercentage?: number;
  currency: string;
  accessDurationDays: number;
  status: string;
}

export interface Order {
  id: string;
  orderIdString: string;
  userId: string;
  itemType: string;
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  user?: Partial<User>;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  authorName: string;
  featuredImage?: string;
  status: string;
  publishedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterest?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId?: string;
  adminEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  detailsJson?: string;
  ipAddress?: string;
  createdAt: string;
}
