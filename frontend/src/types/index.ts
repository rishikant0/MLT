export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  _id?: string;
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
  _id?: string;
  subjectId: string;
  title: string;
  description?: string;
  type: 'PDF' | 'HANDWRITTEN_NOTES' | 'MCQ' | 'QUESTION_BANK' | 'SHORT_NOTES' | 'LONG_QUESTIONS' | 'PREVIOUS_YEAR_QUESTIONS' | 'VIDEO' | 'DOCUMENT' | string;
  fileUrl?: string;
  file?: string;
  filePath?: string;
  previewUrl?: string;
  fileSize?: string;
  isSample?: boolean;
  isPaid?: boolean;
  price?: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  _id?: string;
  semesterId: string | any;
  courseId?: string | any;
  name: string;
  code?: string;
  description?: string;
  fee?: number;
  price?: number;
  offerPrice?: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  materials?: Material[];
}

export interface Semester {
  id: string;
  _id?: string;
  courseId: string | any;
  name: string;
  semesterNumber: number;
  fee?: number;
  price?: number;
  offerPrice?: number;
  order?: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  subjects?: Subject[];
}

export interface Course {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category: 'PHARMACY' | 'MEDICAL LABORATORY' | 'THERAPY' | 'RADIOLOGY' | 'ALLIED HEALTH' | 'NURSING' | string;
  description: string;
  shortDescription?: string;
  duration: string;
  eligibility: string;
  careerOps?: string | string[];
  careerOpportunities?: string[];
  thumbnail?: string;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | string;
  semesterCount?: number;
  startingPrice?: number;
  originalPrice?: number;
  price?: number;
  offerPrice?: number;
  semesters?: Semester[];
  pricing?: {
    fullCoursePrice: number;
    originalPrice: number;
    discountPercentage?: number;
  };
}

export interface Pricing {
  id: string;
  _id?: string;
  entityType: 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL' | string;
  entityId: string;
  price: number;
  offerPrice?: number;
  discountPercentage?: number;
  currency?: string;
  accessDurationDays?: number;
  status?: string;
}

export interface Entitlement {
  id: string;
  _id?: string;
  userId: string | any;
  courseId?: string | any;
  semesterId?: string | any;
  subjectId?: string | any;
  materialId?: string | any;
  purchaseId?: string;
  isFullCourse?: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | string;
  expiresAt?: string;
  createdAt: string;
  course?: Partial<Course>;
  semester?: Partial<Semester>;
  subject?: Partial<Subject>;
}

export interface Order {
  id: string;
  _id?: string;
  orderIdString?: string;
  userId: string | any;
  productType?: string;
  itemType?: 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL' | string;
  courseId?: any;
  semesterId?: any;
  subjectId?: any;
  materialId?: any;
  itemId?: string;
  itemTitle?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  createdAt: string;
  user?: Partial<User>;
}

export interface Purchase {
  id: string;
  _id?: string;
  userId: string | any;
  orderId: string | any;
  productType?: string;
  itemType?: string;
  itemId?: string;
  amount: number;
  status?: string;
  createdAt: string;
  order?: Order;
}

export interface Blog {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  authorName?: string;
  author?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'DRAFT' | 'PUBLISHED' | string;
  publishedAt?: string;
  createdAt?: string;
}

export interface Enquiry {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  courseInterest?: string;
  subject?: string;
  message: string;
  status: 'PENDING' | 'NEW' | 'CONTACTED' | 'RESOLVED' | string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  _id?: string;
  adminId?: string | any;
  adminEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  detailsJson?: string;
  ipAddress?: string;
  createdAt: string;
}
