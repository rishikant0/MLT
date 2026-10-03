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
  type: 'PDF' | 'HANDWRITTEN_NOTES' | 'MCQ' | 'QUESTION_BANK' | 'SHORT_NOTES' | 'LONG_QUESTIONS' | 'PREVIOUS_YEAR_QUESTIONS' | 'VIDEO' | 'DOCUMENT';
  fileUrl: string;
  previewUrl?: string;
  fileSize?: string;
  isSample: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code?: string;
  description?: string;
  fee: number;
  price?: number;
  offerPrice?: number;
  status: 'ACTIVE' | 'INACTIVE';
  materials?: Material[];
}

export interface Semester {
  id: string;
  courseId: string;
  name: string;
  semesterNumber: number;
  fee: number;
  price?: number;
  offerPrice?: number;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  subjects?: Subject[];
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  category: 'PHARMACY' | 'MEDICAL LABORATORY' | 'THERAPY' | 'RADIOLOGY' | 'ALLIED HEALTH' | 'NURSING';
  description: string;
  duration: string;
  eligibility: string;
  careerOps?: string;
  thumbnail?: string;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  semesterCount?: number;
  startingPrice?: number;
  originalPrice?: number;
  semesters?: Semester[];
  pricing?: {
    fullCoursePrice: number;
    fullCourseOfferPrice: number;
    discountPercentage: number;
  };
}

export interface Pricing {
  id: string;
  entityType: 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL';
  entityId: string;
  price: number;
  offerPrice?: number;
  discountPercentage?: number;
  currency: string;
  accessDurationDays: number;
  status: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  courseId?: string;
  semesterId?: string;
  subjectId?: string;
  isFullCourse: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expiresAt?: string;
  createdAt: string;
  course?: Partial<Course>;
  semester?: Partial<Semester>;
  subject?: Partial<Subject>;
}

export interface Order {
  id: string;
  orderIdString: string;
  userId: string;
  itemType: 'COURSE' | 'SEMESTER' | 'SUBJECT';
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  user?: Partial<User>;
}

export interface Purchase {
  id: string;
  userId: string;
  orderId: string;
  itemType: string;
  itemId: string;
  amount: number;
  createdAt: string;
  order?: Order;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  authorName: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterest?: string;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED';
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
