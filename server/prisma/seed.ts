import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Allied Learning Zone database seeding...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.material.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Admin & Demo Student)
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Rishikant Sharma (Admin)',
      email: 'admin@mltlearningzone.com',
      phone: '+91 9876543210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    },
  });
  console.log('✅ Admin user created: admin@mltlearningzone.com / Admin@123');

  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const student = await prisma.user.create({
    data: {
      name: 'Rishikant Kumar',
      email: 'student@mltlearningzone.com',
      phone: '+91 9123456789',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      coursePreference: 'BMLS',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
  });
  console.log('✅ Student user created: student@mltlearningzone.com / Student@123');

  // 3. Seed Courses Definitions (15 Initial Courses across 6 Categories)
  const coursesData = [
    // PHARMACY
    {
      name: 'D.Pharma',
      slug: 'd-pharma',
      category: 'PHARMACY',
      description: 'Diploma in Pharmacy - Comprehensive 2-year diploma program covering pharmaceutical chemistry, pharmacology, clinical pharmacy, and drug store management.',
      duration: '2 Years',
      eligibility: '10+2 with PCB or PCM (Minimum 45%)',
      careerOps: 'Community Pharmacist, Hospital Pharmacy Manager, Medical Representative, Quality Control Assistant',
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60',
      price: 6999,
      offerPrice: 5499,
    },
    {
      name: 'B.Pharma',
      slug: 'b-pharma',
      category: 'PHARMACY',
      description: 'Bachelor of Pharmacy - 4-year undergraduate degree focusing on drug discovery, pharmaceutical engineering, industrial pharmacy, and drug regulatory affairs.',
      duration: '4 Years (8 Semesters)',
      eligibility: '10+2 with PCB/PCM with valid entrance score',
      careerOps: 'Drug Inspector, R&D Scientist, Formulation Pharmacist, Clinical Research Associate',
      thumbnail: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=60',
      price: 14999,
      offerPrice: 11999,
    },

    // MEDICAL LABORATORY
    {
      name: 'DMLS',
      slug: 'dmls',
      category: 'MEDICAL LABORATORY',
      description: 'Diploma in Medical Laboratory Technology - 2-year practical diploma covering clinical biochemistry, diagnostic pathology, hematology, and blood banking.',
      duration: '2 Years',
      eligibility: '10+2 with PCB/PCM or Science Stream',
      careerOps: 'Lab Technician, Diagnostics Analyst, Blood Bank Specialist, Pathology Assistant',
      thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=60',
      price: 7999,
      offerPrice: 5999,
    },
    {
      name: 'BMLS',
      slug: 'bmls',
      category: 'MEDICAL LABORATORY',
      description: 'Bachelor of Medical Laboratory Science - 4-year degree providing advanced expertise in clinical microbiology, immunology, molecular diagnostics, and laboratory management.',
      duration: '4 Years (8 Semesters)',
      eligibility: '10+2 with Physics, Chemistry, Biology (Minimum 50%)',
      careerOps: 'Chief Lab Superintendent, Molecular Pathologist, Diagnostic Consultant, Academic Lecturer',
      thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
      price: 11999,
      offerPrice: 9999,
    },

    // THERAPY
    {
      name: 'DOT',
      slug: 'dot',
      category: 'THERAPY',
      description: 'Diploma in Ophthalmic Technology - Focused training in eye care, refraction testing, visual field testing, and optical assistance.',
      duration: '2 Years',
      eligibility: '10+2 Science Stream',
      careerOps: 'Ophthalmic Assistant, Vision Care Specialist, Optical Store Consultant',
      thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60',
      price: 6499,
      offerPrice: 4999,
    },
    {
      name: 'BOT',
      slug: 'bot',
      category: 'THERAPY',
      description: 'Bachelor of Occupational Therapy - Professional undergraduate program training practitioners in physical rehabilitation, sensory therapy, and patient independence restoration.',
      duration: '4.5 Years',
      eligibility: '10+2 with Physics, Chemistry, Biology',
      careerOps: 'Occupational Therapist, Rehabilitation Specialist, Pediatric Therapy Consultant',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=60',
      price: 12999,
      offerPrice: 9999,
    },

    // RADIOLOGY
    {
      name: 'DRIT',
      slug: 'drit',
      category: 'RADIOLOGY',
      description: 'Diploma in Radiography and Imaging Technology - Hands-on diploma covering X-ray technology, ultrasound imaging, CT scan operation, and radiation safety.',
      duration: '2 Years',
      eligibility: '10+2 with Physics & Chemistry',
      careerOps: 'X-Ray Technician, Radiographic Assistant, CT Technologist',
      thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=60',
      price: 8499,
      offerPrice: 6499,
    },
    {
      name: 'BRIT',
      slug: 'brit',
      category: 'RADIOLOGY',
      description: 'Bachelor of Radiography and Imaging Technology - 3.5-year advanced degree in MRI, PET-CT, Nuclear Medicine, Interventional Radiology, and Diagnostic Imaging.',
      duration: '3.5 Years',
      eligibility: '10+2 with PCB (Minimum 50%)',
      careerOps: 'Senior MRI Technologist, Radiologic Specialist, Hospital Imaging Manager',
      thumbnail: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=60',
      price: 13999,
      offerPrice: 10999,
    },

    // ALLIED HEALTH
    {
      name: 'B.Sc. Cath Lab',
      slug: 'bsc-cath-lab',
      category: 'ALLIED HEALTH',
      description: 'B.Sc. in Cardiac Care & Cath Lab Technology - Specialized training in angioplasty assistance, cardiac catheterization procedures, and ECG monitoring.',
      duration: '3 Years',
      eligibility: '10+2 PCB',
      careerOps: 'Cath Lab Technologist, Cardiac Monitor Specialist, ICU Cardiac Assistant',
      thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=60',
      price: 12499,
      offerPrice: 9499,
    },
    {
      name: 'B.Sc. Optometry',
      slug: 'bsc-optometry',
      category: 'ALLIED HEALTH',
      description: 'B.Sc. in Optometry - Professional degree covering vision screening, contact lens prescribing, low vision care, and ocular diagnostics.',
      duration: '4 Years',
      eligibility: '10+2 PCB/PCM',
      careerOps: 'Optometrist, Eye Clinic Owner, Contact Lens Specialist, Clinical Optometry Researcher',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60',
      price: 11999,
      offerPrice: 8999,
    },
    {
      name: 'B.Sc. Cardiac Perfusion',
      slug: 'bsc-cardiac-perfusion',
      category: 'ALLIED HEALTH',
      description: 'B.Sc. in Cardiac Perfusion Technology - Expert clinical training in operating heart-lung machines during open-heart surgeries.',
      duration: '3 Years',
      eligibility: '10+2 PCB (Minimum 50%)',
      careerOps: 'Perfusionist, Cardiac Surgery Specialist, Surgical ICU Coordinator',
      thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&auto=format&fit=crop&q=60',
      price: 13499,
      offerPrice: 10499,
    },
    {
      name: 'B.Sc. Emergency Technician',
      slug: 'bsc-emergency-technician',
      category: 'ALLIED HEALTH',
      description: 'B.Sc. in Emergency & Trauma Care Technology - Lifesaving training in trauma resuscitation, emergency triage, and critical care transport.',
      duration: '3 Years',
      eligibility: '10+2 PCB',
      careerOps: 'Emergency Care Specialist, Paramedic Team Leader, Trauma ICU Technologist',
      thumbnail: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&auto=format&fit=crop&q=60',
      price: 9999,
      offerPrice: 7999,
    },

    // NURSING
    {
      name: 'ANM',
      slug: 'anm',
      category: 'NURSING',
      description: 'Auxiliary Nurse Midwifery - 2-year fundamental nursing diploma focusing on maternal health, child healthcare, and community health services.',
      duration: '2 Years',
      eligibility: '10+2 Any Stream',
      careerOps: 'Community Health Worker, Primary Health Centre Nurse, Maternal Care Assistant',
      thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=60',
      price: 5999,
      offerPrice: 4499,
    },
    {
      name: 'GNM',
      slug: 'gnm',
      category: 'NURSING',
      description: 'General Nursing and Midwifery - 3-year comprehensive diploma covering bedside nursing, surgical care, pediatric nursing, and clinical ward management.',
      duration: '3 Years',
      eligibility: '10+2 with PCB (Minimum 40%)',
      careerOps: 'Staff Nurse, Nursing Supervisor, Clinic Nurse, Critical Care Nurse',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
      price: 8999,
      offerPrice: 6999,
    },
    {
      name: 'B.Sc. Nursing',
      slug: 'bsc-nursing',
      category: 'NURSING',
      description: 'Bachelor of Science in Nursing - 4-year premier nursing degree providing advanced clinical expertise, patient care, nursing research, and leadership.',
      duration: '4 Years (8 Semesters)',
      eligibility: '10+2 PCB (Minimum 45%) with English',
      careerOps: 'Nursing Officer, ICU Specialist Nurse, Clinical Educator, International Healthcare Nurse',
      thumbnail: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&auto=format&fit=crop&q=60',
      price: 14999,
      offerPrice: 11999,
    },
  ];

  for (const cData of coursesData) {
    const { price, offerPrice, ...cFields } = cData;
    const course = await prisma.course.create({
      data: {
        ...cFields,
        status: 'ACTIVE',
      },
    });

    // Create course-level pricing
    await prisma.pricing.create({
      data: {
        entityType: 'COURSE',
        entityId: course.id,
        price,
        offerPrice,
        discountPercentage: Math.round(((price - offerPrice) / price) * 100),
        accessDurationDays: 365,
      },
    });

    // 4. Create realistic Semesters & Subjects for BMLS & DMLS as flagship models
    let semesterCount = 4;
    if (cData.slug === 'd-pharma' || cData.slug === 'dmls' || cData.slug === 'drit' || cData.slug === 'anm') semesterCount = 2;
    if (cData.slug === 'b-pharma' || cData.slug === 'bmls' || cData.slug === 'bsc-nursing') semesterCount = 4;

    for (let semNum = 1; semNum <= semesterCount; semNum++) {
      const semesterFee = 2999;
      const semester = await prisma.semester.create({
        data: {
          courseId: course.id,
          name: `Semester ${semNum}`,
          semesterNumber: semNum,
          fee: semesterFee,
          order: semNum,
          status: 'ACTIVE',
        },
      });

      await prisma.pricing.create({
        data: {
          entityType: 'SEMESTER',
          entityId: semester.id,
          price: semesterFee,
          offerPrice: 2499,
          discountPercentage: 17,
        },
      });

      // Sample Subjects for each Semester
      const subjectNames =
        semNum === 1
          ? ['Anatomy & Physiology', 'Clinical Biochemistry', 'Basic Microbiology', 'Pathology & Histology']
          : semNum === 2
          ? ['Hematology & Blood Banking', 'Clinical Pathology', 'Immunology & Serology', 'Systemic Bacteriology']
          : semNum === 3
          ? ['Advanced Hematology', 'Diagnostic Biochemistry', 'Medical Parasitology', 'Clinical Histopathology']
          : ['Clinical Practice & Internship', 'Laboratory Management & Ethics', 'Molecular Diagnostics', 'Research Methodology'];

      for (const subjName of subjectNames) {
        const subjectFee = 499;
        const subject = await prisma.subject.create({
          data: {
            semesterId: semester.id,
            name: subjName,
            code: `${course.slug.toUpperCase().substring(0, 4)}-SEM${semNum}-${subjName.substring(0, 3).toUpperCase()}`,
            description: `Core study module for ${subjName} covering essential theory, clinical lab protocols, and exam-focused notes.`,
            fee: subjectFee,
            status: 'ACTIVE',
          },
        });

        await prisma.pricing.create({
          data: {
            entityType: 'SUBJECT',
            entityId: subject.id,
            price: subjectFee,
            offerPrice: 399,
            discountPercentage: 20,
          },
        });

        // 5. Create realistic Study Materials inside Subject
        const materialsToSeed = [
          {
            title: `${subjName} - Complete Lecture PDF Notes`,
            description: 'Comprehensive high-resolution lecture notes covering fundamental concepts, diagrams, and key definitions.',
            type: 'PDF',
            isSample: true, // Free sample preview enabled!
            fileSize: '4.2 MB',
          },
          {
            title: `${subjName} - Handwritten Rapid Revision Notes`,
            description: 'Topper handwritten short notes for quick exam revision with highlighted formulas and flowcharts.',
            type: 'HANDWRITTEN_NOTES',
            isSample: false,
            fileSize: '6.8 MB',
          },
          {
            title: `${subjName} - 250+ Solved Practice MCQs`,
            description: 'Exam-focused multiple choice question bank with detailed explanations for government & university exams.',
            type: 'MCQ',
            isSample: false,
            fileSize: '1.5 MB',
          },
          {
            title: `${subjName} - 10 Years Previous Question Papers`,
            description: 'Solved past university papers with sample model answer keys.',
            type: 'PREVIOUS_YEAR_QUESTIONS',
            isSample: false,
            fileSize: '3.1 MB',
          },
        ];

        for (const mat of materialsToSeed) {
          await prisma.material.create({
            data: {
              subjectId: subject.id,
              title: mat.title,
              description: mat.description,
              type: mat.type,
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: mat.fileSize,
              isSample: mat.isSample,
              status: 'ACTIVE',
            },
          });
        }
      }
    }
  }

  console.log('✅ Seeded 15 Courses with Semesters, Subjects, Materials, and Pricing!');

  // 6. Seed Blog Posts
  const blogsData = [
    {
      title: 'How to Crack BMLS & DMLS Entrance & University Exams with High Marks',
      slug: 'how-to-crack-bmls-dmls-exams',
      category: 'Exam Tips',
      content: `Medical laboratory science requires both theoretical clarity and practical precision. In this comprehensive guide, we cover step-by-step strategies to master Hematology, Biochemistry, and Microbiology. Focus heavily on flowcharts, diagnostic algorithms, and daily diagram drawing to secure top university rank.`,
      authorName: 'Dr. Rishikant Sharma',
      featuredImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
      seoTitle: 'BMLS & DMLS Exam Preparation Strategy 2026',
      seoDescription: 'Proven exam tips and study plan for Medical Laboratory Science students.',
    },
    {
      title: 'Top 10 Career Opportunities after B.Pharma and D.Pharma in 2026',
      slug: 'top-10-career-opportunities-after-bpharma-dpharma',
      category: 'Career Guidance',
      content: `Pharmacy education opens doors to diverse sectors including clinical trial management, drug inspector posts, quality assurance in pharmaceutical manufacturing, and independent retail pharmacy chains. Discover salary insights, required certifications, and global opportunities.`,
      authorName: 'Prof. Ananya Sen',
      featuredImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      seoTitle: 'Pharmacy Careers 2026 - B.Pharma & D.Pharma Jobs',
      seoDescription: 'Explore top career paths, high-paying jobs, and higher study options after Pharmacy degree.',
    },
    {
      title: 'Understanding Radiography: Career Path in BRIT & DRIT Technology',
      slug: 'understanding-radiography-career-path-brit-drit',
      category: 'Radiology',
      content: `Radiology technicians play a essential role in modern diagnostic medicine. Learn about operating CT scans, MRI machines, radiation safety guidelines, and job growth in top hospital chains across India and abroad.`,
      authorName: 'Dr. S. K. Sharma',
      featuredImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      seoTitle: 'Radiography & MRI Technology Career Guide',
      seoDescription: 'Complete overview of BRIT and DRIT radiography technician jobs and training.',
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.create({
      data: {
        ...blog,
        status: 'PUBLISHED',
      },
    });
  }
  console.log('✅ Seeded Blog Articles!');

  // 7. Seed Active Entitlement for Demo Student (so student account can view BMLS Semester 1 material out-of-the-box!)
  const bmlsCourse = await prisma.course.findUnique({ where: { slug: 'bmls' } });
  if (bmlsCourse) {
    const sem1 = await prisma.semester.findFirst({
      where: { courseId: bmlsCourse.id, semesterNumber: 1 },
    });

    if (sem1) {
      await prisma.entitlement.create({
        data: {
          userId: student.id,
          courseId: bmlsCourse.id,
          semesterId: sem1.id,
          status: 'ACTIVE',
        },
      });

      // Also seed sample purchase order
      const order = await prisma.order.create({
        data: {
          orderIdString: 'ORD_DEMO_998877',
          userId: student.id,
          itemType: 'SEMESTER',
          itemId: sem1.id,
          itemTitle: 'BMLS - Semester 1 Access',
          amount: 2499,
          currency: 'INR',
          status: 'PAID',
          razorpayOrderId: 'order_demo_101',
          razorpayPaymentId: 'pay_demo_101',
        },
      });

      await prisma.purchase.create({
        data: {
          userId: student.id,
          orderId: order.id,
          itemType: 'SEMESTER',
          itemId: sem1.id,
          amount: 2499,
        },
      });
    }
  }

  // 8. Seed sample enquiries
  await prisma.enquiry.createMany({
    data: [
      {
        name: 'Aman Verma',
        email: 'aman.verma@example.com',
        phone: '9812345678',
        courseInterest: 'BMLS',
        message: 'Hello, I want to know about the total fee structure and study material availability for BMLS Semester 1.',
        status: 'PENDING',
      },
      {
        name: 'Priya Kumari',
        email: 'priya.k@example.com',
        phone: '9765432109',
        courseInterest: 'D.Pharma',
        message: 'Is handwritten notes download available for D.Pharma students?',
        status: 'CONTACTED',
      },
    ],
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
