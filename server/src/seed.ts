import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './lib/db';
import {
  User,
  Course,
  Semester,
  Subject,
  Material,
  Blog,
} from './models';

dotenv.config();

const INITIAL_COURSES = [
  { name: 'D Pharma', category: 'Pharmacy', duration: '2 Years', eligibility: '10+2 PCB/PCM' },
  { name: 'B Pharma', category: 'Pharmacy', duration: '4 Years', eligibility: '10+2 PCB/PCM (50%)' },
  { name: 'DMLT', category: 'Medical Lab Technology', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BMLS', category: 'Medical Lab Technology', duration: '4 Years', eligibility: '10+2 PCB/PCM' },
  { name: 'DOT', category: 'Operation Theatre', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BOT', category: 'Operation Theatre', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'DRIT', category: 'Radiology & Imaging', duration: '2 Years', eligibility: '10+2 Science' },
  { name: 'BRIT', category: 'Radiology & Imaging', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Cath Lab', category: 'Cardiology Technology', duration: '3 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Optometry', category: 'Eye Care Technology', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Cardiac Perfusion', category: 'Cardiology Technology', duration: '4 Years', eligibility: '10+2 PCB' },
  { name: 'B.Sc Emergency Technician', category: 'Critical & Emergency Care', duration: '3 Years', eligibility: '10+2 PCB' },
  { name: 'ANM', category: 'Nursing Care', duration: '2 Years', eligibility: '10+2 Any Stream' },
  { name: 'GNM', category: 'Nursing Care', duration: '3 Years', eligibility: '10+2 PCB (40%)' },
  { name: 'B.Sc Nursing', category: 'Nursing Care', duration: '4 Years', eligibility: '10+2 PCB (45%)' },
];

async function seed() {
  await connectDB();

  console.log('🌱 Starting MongoDB database seeding for MLT Learning Zone...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Semester.deleteMany({}),
    Subject.deleteMany({}),
    Material.deleteMany({}),
    Blog.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database records.');

  // 1. Seed Demo Admin & Student Users
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const studentPassword = await bcrypt.hash('Student@12345', 10);

  const admin = await User.create({
    name: 'Academic Administrator',
    email: 'admin@mltlearningzone.com',
    phone: '+919876543210',
    password: adminPassword,
    role: 'ADMIN',
    isVerified: true,
    status: 'ACTIVE',
  });

  const student = await User.create({
    name: 'Rahul Sharma',
    email: 'student@mltlearningzone.com',
    phone: '+919876543211',
    password: studentPassword,
    role: 'STUDENT',
    isVerified: true,
    status: 'ACTIVE',
  });

  console.log(`👤 Admin created: ${admin.email}`);
  console.log(`👤 Student created: ${student.email}`);

  // 2. Seed All 15 Courses
  const createdCourses = [];
  for (const cData of INITIAL_COURSES) {
    const slug = cData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const course = await Course.create({
      name: cData.name,
      slug,
      category: cData.category,
      duration: cData.duration,
      eligibility: cData.eligibility,
      shortDescription: `Professional ${cData.name} degree curriculum notes, MCQs, and exam question banks.`,
      description: `Comprehensive academic prep program for ${cData.name} students containing verified medical notes, handwritten summaries, chapterwise MCQs, and previous year university exam questions.`,
      careerOpportunities: [
        'Government & Private Hospitals',
        'Clinical Diagnostic Centers',
        'Medical Research Institutions',
        'Healthcare Quality Assurance',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
    });
    createdCourses.push(course);
  }

  console.log(`📚 ${createdCourses.length} courses seeded successfully.`);

  // 3. Seed Semesters, Subjects, and Materials for BMLS and DMLT
  const bmlsCourse = createdCourses.find((c) => c.slug === 'bmls') || createdCourses[0];

  const sem1 = await Semester.create({
    courseId: bmlsCourse._id,
    name: 'Semester 1',
    semesterNumber: 1,
    description: 'Foundational Human Anatomy, Physiology, and Laboratory Instruments',
    price: 2999,
    status: 'ACTIVE',
  });

  const sem2 = await Semester.create({
    courseId: bmlsCourse._id,
    name: 'Semester 2',
    semesterNumber: 2,
    description: 'Clinical Biochemistry and General Microbiology',
    price: 2999,
    status: 'ACTIVE',
  });

  // Subjects for Sem 1
  const subjAnatomy = await Subject.create({
    courseId: bmlsCourse._id,
    semesterId: sem1._id,
    name: 'Anatomy & Physiology',
    code: 'BMLS-101',
    description: 'Complete Human Organ Systems, Tissue Histology, and Anatomical Landmarks',
    price: 499,
    status: 'ACTIVE',
  });

  const subjBiochem = await Subject.create({
    courseId: bmlsCourse._id,
    semesterId: sem1._id,
    name: 'Biochemistry & Hematology',
    code: 'BMLS-102',
    description: 'Blood Cell Physiology, Hemoglobin Estimations, and Biomolecules',
    price: 499,
    status: 'ACTIVE',
  });

  // Materials for Anatomy
  await Material.create([
    {
      courseId: bmlsCourse._id,
      semesterId: sem1._id,
      subjectId: subjAnatomy._id,
      title: 'Human Cardiovascular System Detailed Notes',
      description: 'Comprehensive chapterwise PDF notes covering Heart Anatomy, Blood Vessels, and Cardiac Cycle.',
      type: 'PDF',
      file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '4.8 MB',
      mimeType: 'application/pdf',
      isPaid: true,
      price: 199,
      status: 'ACTIVE',
    },
    {
      courseId: bmlsCourse._id,
      semesterId: sem1._id,
      subjectId: subjAnatomy._id,
      title: 'Anatomy Topper Handwritten Notes',
      description: 'High-yield handwritten diagrams and mnemonics for rapid revision before exams.',
      type: 'HANDWRITTEN_NOTES',
      file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '6.2 MB',
      mimeType: 'application/pdf',
      isPaid: true,
      price: 199,
      status: 'ACTIVE',
    },
    {
      courseId: bmlsCourse._id,
      semesterId: sem1._id,
      subjectId: subjAnatomy._id,
      title: '500+ High Yield Anatomy MCQ Question Bank',
      description: 'Topicwise Multiple Choice Questions with complete explanations and rationale.',
      type: 'MCQ',
      file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '3.1 MB',
      mimeType: 'application/pdf',
      isPaid: false, // Free sample
      price: 0,
      status: 'ACTIVE',
    },
    {
      courseId: bmlsCourse._id,
      semesterId: sem1._id,
      subjectId: subjAnatomy._id,
      title: '5 Years Solved Previous University Question Papers',
      description: 'Solved long-answer questions and short notes from previous 5 years exams.',
      type: 'PREVIOUS_YEAR',
      file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '5.5 MB',
      mimeType: 'application/pdf',
      isPaid: true,
      price: 199,
      status: 'ACTIVE',
    },
  ]);

  console.log('📖 Sample Semesters, Subjects, and Materials created.');

  // 4. Seed Blogs
  await Blog.create([
    {
      title: 'How to Crack BMLS & DMLT Board Exams in 2026',
      slug: 'how-to-crack-bmls-dmlt-board-exams-2026',
      category: 'Exam Strategy',
      author: 'Dr. Suresh Kumar, HOD MLT',
      content: `Preparing for Medical Laboratory Technology university exams requires structured planning, continuous diagram practice, and clear conceptual understanding of Clinical Biochemistry and Pathology.\n\nKey Strategies:\n1. Focus on Diagrammatic Representations\n2. Solve 5 Previous Years Question Papers\n3. Memorize Normal Reference Values for Hematology and Bio-chemistry tests.`,
      status: 'PUBLISHED',
      seoTitle: 'BMLS & DMLT Exam Preparation Strategy Guide 2026',
      seoDescription: 'Expert academic advice for paramedical students to clear BMLS and DMLT semester exams with top distinction.',
    },
    {
      title: 'Top Career Opportunities after B.Pharma and D.Pharma',
      slug: 'top-career-opportunities-after-bpharma-dpharma',
      category: 'Career Guidance',
      author: 'Prof. Ananya Sen',
      content: `Pharmacy education opens doors to diverse sectors including Pharmaceutical Manufacturing, Quality Control, Clinical Research, Regulatory Affairs, and Retail Pharmacy Entrepreneurship.`,
      status: 'PUBLISHED',
      seoTitle: 'B Pharma & D Pharma Career Options & Salary Guide',
      seoDescription: 'Explore high-paying career paths and job profiles for Pharmacy graduates in India and abroad.',
    },
  ]);

  console.log('📰 Sample Blogs seeded successfully.');
  console.log('✅ DATABASE SEEDING COMPLETE!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
