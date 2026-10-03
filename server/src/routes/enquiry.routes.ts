import { Router } from 'express';
import { z } from 'zod';
import { Enquiry } from '../models';

const router = Router();

const enquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  course: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

router.post('/', async (req, res) => {
  try {
    const parsed = enquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { name, email, phone, course, message } = parsed.data;

    const enquiry = await Enquiry.create({
      name,
      email: email.toLowerCase(),
      phone,
      course: course || 'General Enquiry',
      message,
      status: 'NEW',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting MLT Learning Zone! Our academic counselor will contact you shortly.',
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit enquiry.' });
  }
});

export default router;
