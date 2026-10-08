import mongoose from 'mongoose';
import { Course, Semester, Subject, Material, Pricing } from '../models';

export interface PriceCalculationParams {
  productType: 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL';
  courseId?: string;
  semesterId?: string;
  subjectId?: string;
  materialId?: string;
}

export interface PriceCalculationResult {
  success: boolean;
  message?: string;
  pricing?: {
    productType: string;
    courseId?: string;
    semesterId?: string;
    subjectId?: string;
    materialId?: string;
    title: string;
    originalPrice: number;
    discount: number;
    discountPercentage: number;
    finalPrice: number;
    currency: string;
  };
}

/**
 * Calculates authoritative payment pricing from MongoDB database.
 * No hardcoded price fallbacks are used. If price is unconfigured, returns 400 error.
 */
export async function calculateCoursePrice(params: PriceCalculationParams): Promise<PriceCalculationResult> {
  const { productType, courseId, semesterId, subjectId, materialId } = params;

  let entityIdToSearch: string | undefined;
  let title = 'Study Content';

  if (productType === 'COURSE') {
    entityIdToSearch = courseId;
  } else if (productType === 'SEMESTER') {
    entityIdToSearch = semesterId;
  } else if (productType === 'SUBJECT') {
    entityIdToSearch = subjectId;
  } else if (productType === 'MATERIAL') {
    entityIdToSearch = materialId;
  }

  if (!entityIdToSearch || !mongoose.Types.ObjectId.isValid(entityIdToSearch)) {
    return {
      success: false,
      message: `Invalid or missing ID for ${productType ? productType.toLowerCase() : 'item'} purchase.`,
    };
  }

  const objId = new mongoose.Types.ObjectId(entityIdToSearch);

  // 1. Check explicit Pricing matrix rule in database
  const explicitRule = await Pricing.findOne({
    entityType: productType,
    entityId: objId,
  });

  let originalPrice = 0;
  let finalPrice = 0;
  let foundValidPrice = false;

  // 2. Fetch specific entity details from database
  if (productType === 'COURSE') {
    const course = await Course.findById(objId);
    if (!course) {
      return { success: false, message: 'Course not found.' };
    }
    title = course.name;

    if (explicitRule && explicitRule.offerPrice > 0) {
      originalPrice = explicitRule.price || explicitRule.offerPrice;
      finalPrice = explicitRule.offerPrice;
      foundValidPrice = true;
    } else {
      // Sum active semesters fees
      const activeSemesters = await Semester.find({ courseId: course._id, status: 'ACTIVE' });
      const semTotal = activeSemesters.reduce((sum, s) => sum + (s.price || 0), 0);
      if (semTotal > 0) {
        originalPrice = semTotal;
        finalPrice = Math.round(semTotal * 0.85); // 15% discount bundle
        foundValidPrice = true;
      }
    }
  } else if (productType === 'SEMESTER') {
    const semester = await Semester.findById(objId);
    if (!semester) {
      return { success: false, message: 'Semester not found.' };
    }
    title = semester.name;

    if (explicitRule && explicitRule.offerPrice > 0) {
      originalPrice = explicitRule.price || explicitRule.offerPrice;
      finalPrice = explicitRule.offerPrice;
      foundValidPrice = true;
    } else if (semester.price && semester.price > 0) {
      originalPrice = Math.round(semester.price * 1.2);
      finalPrice = semester.price;
      foundValidPrice = true;
    }
  } else if (productType === 'SUBJECT') {
    const subject = await Subject.findById(objId);
    if (!subject) {
      return { success: false, message: 'Subject not found.' };
    }
    title = subject.name;

    if (explicitRule && explicitRule.offerPrice > 0) {
      originalPrice = explicitRule.price || explicitRule.offerPrice;
      finalPrice = explicitRule.offerPrice;
      foundValidPrice = true;
    } else if (subject.price && subject.price > 0) {
      originalPrice = Math.round(subject.price * 1.25);
      finalPrice = subject.price;
      foundValidPrice = true;
    }
  } else if (productType === 'MATERIAL') {
    const material = await Material.findById(objId);
    if (!material) {
      return { success: false, message: 'Material not found.' };
    }
    title = material.title;

    if (!material.isPaid) {
      return {
        success: true,
        pricing: {
          productType,
          materialId: entityIdToSearch,
          title,
          originalPrice: 0,
          discount: 0,
          discountPercentage: 0,
          finalPrice: 0,
          currency: 'INR',
        },
      };
    }

    if (explicitRule && explicitRule.offerPrice > 0) {
      originalPrice = explicitRule.price || explicitRule.offerPrice;
      finalPrice = explicitRule.offerPrice;
      foundValidPrice = true;
    } else if (material.price && material.price > 0) {
      originalPrice = Math.round(material.price * 1.25);
      finalPrice = material.price;
      foundValidPrice = true;
    }
  }

  if (!foundValidPrice || finalPrice <= 0) {
    return {
      success: false,
      message: 'Price is not configured for this course.',
    };
  }

  if (originalPrice < finalPrice) {
    originalPrice = finalPrice;
  }

  const discount = Math.max(0, originalPrice - finalPrice);
  const discountPercentage = originalPrice > finalPrice ? Math.round((discount / originalPrice) * 100) : 0;

  return {
    success: true,
    pricing: {
      productType,
      courseId,
      semesterId,
      subjectId,
      materialId,
      title,
      originalPrice,
      discount,
      discountPercentage,
      finalPrice,
      currency: 'INR',
    },
  };
}

export interface ResolveEffectivePriceParams {
  courseId?: string;
  semesterId?: string;
  subjectId?: string;
  materialId?: string;
  productType?: string;
}

export interface EffectivePriceResult {
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  source: string;
}

/**
 * Authoritative Server-Side Price Resolution Function.
 * Hierarchy: Subject -> Semester -> Course -> Database document default.
 */
export async function resolveEffectivePrice(params: ResolveEffectivePriceParams): Promise<EffectivePriceResult> {
  const { courseId, semesterId, subjectId, materialId } = params;

  // 1. Check Subject-level pricing rule / subject price
  if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
    const subjObjId = new mongoose.Types.ObjectId(subjectId);
    const rule = await Pricing.findOne({ entityType: { $in: ['SUBJECT', 'subject'] }, entityId: subjObjId });
    const subject = await Subject.findById(subjObjId);

    if (rule && rule.offerPrice > 0) {
      const orig = rule.price || rule.offerPrice;
      const offer = rule.offerPrice;
      const disc = orig > offer ? Math.round(((orig - offer) / orig) * 100) : 0;
      return { originalPrice: orig, offerPrice: offer, discountPercentage: disc, source: 'subject_pricing_rule' };
    }

    if (subject && subject.price && subject.price > 0) {
      return { originalPrice: subject.price, offerPrice: subject.price, discountPercentage: 0, source: 'subject_document' };
    }
  }

  // 2. Check Semester-level pricing rule / semester price
  if (semesterId && mongoose.Types.ObjectId.isValid(semesterId)) {
    const semObjId = new mongoose.Types.ObjectId(semesterId);
    const rule = await Pricing.findOne({ entityType: { $in: ['SEMESTER', 'semester'] }, entityId: semObjId });
    const semester = await Semester.findById(semObjId);

    if (rule && rule.offerPrice > 0) {
      const orig = rule.price || rule.offerPrice;
      const offer = rule.offerPrice;
      const disc = orig > offer ? Math.round(((orig - offer) / orig) * 100) : 0;
      return { originalPrice: orig, offerPrice: offer, discountPercentage: disc, source: 'semester_pricing_rule' };
    }

    if (semester && semester.price && semester.price > 0) {
      return { originalPrice: semester.price, offerPrice: semester.price, discountPercentage: 0, source: 'semester_document' };
    }
  }

  // 3. Check Course-level pricing rule / course price
  if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
    const crsObjId = new mongoose.Types.ObjectId(courseId);
    const rule = await Pricing.findOne({ entityType: { $in: ['COURSE', 'course'] }, entityId: crsObjId });
    const course = await Course.findById(crsObjId);

    if (rule && rule.offerPrice > 0) {
      const orig = rule.price || rule.offerPrice;
      const offer = rule.offerPrice;
      const disc = orig > offer ? Math.round(((orig - offer) / orig) * 100) : 0;
      return { originalPrice: orig, offerPrice: offer, discountPercentage: disc, source: 'course_pricing_rule' };
    }

    if (course) {
      const offer = course.offerPrice || course.price || 0;
      const orig = course.price || offer;
      const disc = orig > offer ? Math.round(((orig - offer) / orig) * 100) : 0;
      return { originalPrice: orig, offerPrice: offer, discountPercentage: disc, source: 'course_document' };
    }
  }

  // 4. Material-level fallback
  if (materialId && mongoose.Types.ObjectId.isValid(materialId)) {
    const matObjId = new mongoose.Types.ObjectId(materialId);
    const material = await Material.findById(matObjId);
    if (material && material.price > 0) {
      return { originalPrice: material.price, offerPrice: material.price, discountPercentage: 0, source: 'material_document' };
    }
  }

  return { originalPrice: 0, offerPrice: 0, discountPercentage: 0, source: 'none' };
}
