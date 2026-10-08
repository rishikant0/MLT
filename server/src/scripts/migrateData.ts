import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Course, Semester, Subject, Material, User } from '../models';
import { initializeAdminUser } from '../utils/adminInit';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runDataMigration() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas for Data Integrity Audit & Migration...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas.');

  console.log('\n============================================================');
  console.log('🔍 PHASE 1: ADMIN USER INTEGRITY VERIFICATION');
  console.log('============================================================');
  await initializeAdminUser();

  console.log('\n============================================================');
  console.log('🔍 PHASE 2: COURSES AUDIT');
  console.log('============================================================');
  const courses = await Course.find();
  console.log(`Found ${courses.length} Course documents.`);

  let firstCourseId: mongoose.Types.ObjectId | null = courses.length > 0 ? courses[0]._id : null;

  if (courses.length === 0) {
    console.log('No courses found in database. Creating default BMLS course...');
    const defaultCourse = await Course.create({
      name: 'BMLS (Bachelor of Medical Laboratory Science)',
      slug: 'bmls',
      category: 'Allied Health',
      description: 'Comprehensive 3-Year degree in Medical Laboratory Science.',
      shortDescription: 'Core MLT Bachelor Program',
      duration: '3 Years',
      eligibility: '10+2 PCB',
      price: 7000,
      offerPrice: 6500,
      status: 'ACTIVE',
    });
    firstCourseId = defaultCourse._id;
    console.log(`✅ Default Course created: ${defaultCourse.name} (ID: ${defaultCourse._id})`);
  }

  console.log('\n============================================================');
  console.log('🔍 PHASE 3: SEMESTERS RELATIONSHIP AUDIT');
  console.log('============================================================');
  const semesters = await Semester.find();
  console.log(`Found ${semesters.length} Semester documents.`);

  let fixedSemesters = 0;
  for (const sem of semesters) {
    if (!sem.courseId || !mongoose.Types.ObjectId.isValid(sem.courseId.toString())) {
      sem.courseId = firstCourseId!;
      await sem.save();
      fixedSemesters++;
      console.log(`Updated Semester "${sem.name}" with courseId: ${firstCourseId}`);
    }
  }
  console.log(`Semesters Audit Complete. Fixed missing references: ${fixedSemesters}`);

  let firstSemesterId: mongoose.Types.ObjectId | null = semesters.length > 0 ? semesters[0]._id : null;
  if (!firstSemesterId && firstCourseId) {
    const defaultSem = await Semester.create({
      courseId: firstCourseId,
      name: 'Semester 1',
      semesterNumber: 1,
      description: 'First Semester Core Subjects',
      price: 2999,
      status: 'ACTIVE',
    });
    firstSemesterId = defaultSem._id;
    console.log(`✅ Default Semester created: ${defaultSem.name} (ID: ${defaultSem._id})`);
  }

  console.log('\n============================================================');
  console.log('🔍 PHASE 4: SUBJECTS RELATIONSHIP AUDIT');
  console.log('============================================================');
  const subjects = await Subject.find();
  console.log(`Found ${subjects.length} Subject documents.`);

  let fixedSubjects = 0;
  for (const subj of subjects) {
    let modified = false;

    if (!subj.semesterId || !mongoose.Types.ObjectId.isValid(subj.semesterId.toString())) {
      subj.semesterId = firstSemesterId!;
      modified = true;
    }

    if (!subj.courseId || !mongoose.Types.ObjectId.isValid(subj.courseId.toString())) {
      const parentSem = await Semester.findById(subj.semesterId);
      subj.courseId = parentSem?.courseId || firstCourseId!;
      modified = true;
    }

    if (modified) {
      await subj.save();
      fixedSubjects++;
      console.log(`Updated Subject "${subj.name}" with semesterId: ${subj.semesterId}, courseId: ${subj.courseId}`);
    }
  }
  console.log(`Subjects Audit Complete. Fixed missing references: ${fixedSubjects}`);

  let firstSubjectId: mongoose.Types.ObjectId | null = subjects.length > 0 ? subjects[0]._id : null;
  if (!firstSubjectId && firstSemesterId && firstCourseId) {
    const defaultSubj = await Subject.create({
      courseId: firstCourseId,
      semesterId: firstSemesterId,
      name: 'Anatomy & Physiology',
      code: 'BMLS-101',
      description: 'Human Body Systems & Pathology',
      price: 499,
      status: 'ACTIVE',
    });
    firstSubjectId = defaultSubj._id;
    console.log(`✅ Default Subject created: ${defaultSubj.name} (ID: ${defaultSubj._id})`);
  }

  console.log('\n============================================================');
  console.log('🔍 PHASE 5: STUDY MATERIALS RELATIONSHIP AUDIT');
  console.log('============================================================');
  const materials = await Material.find();
  console.log(`Found ${materials.length} Material documents.`);

  let fixedMaterials = 0;
  for (const mat of materials) {
    let modified = false;

    if (!mat.subjectId || !mongoose.Types.ObjectId.isValid(mat.subjectId.toString())) {
      mat.subjectId = firstSubjectId!;
      modified = true;
    }

    if (!mat.semesterId || !mongoose.Types.ObjectId.isValid(mat.semesterId.toString())) {
      const parentSubj = await Subject.findById(mat.subjectId);
      mat.semesterId = parentSubj?.semesterId || firstSemesterId!;
      modified = true;
    }

    if (!mat.courseId || !mongoose.Types.ObjectId.isValid(mat.courseId.toString())) {
      const parentSubj = await Subject.findById(mat.subjectId);
      mat.courseId = parentSubj?.courseId || firstCourseId!;
      modified = true;
    }

    if (modified) {
      await mat.save();
      fixedMaterials++;
      console.log(`Updated Material "${mat.title}" with parents courseId: ${mat.courseId}, semesterId: ${mat.semesterId}, subjectId: ${mat.subjectId}`);
    }
  }
  console.log(`Materials Audit Complete. Fixed missing parent references: ${fixedMaterials}`);

  console.log('\n============================================================');
  console.log('🎉 DATA INTEGRITY AUDIT & MIGRATION FINISHED SUCCESSFULLY');
  console.log('============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runDataMigration().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
