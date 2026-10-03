import { Router } from 'express';
import { Blog } from '../models';

const router = Router();

// Public blogs list: GET /api/blog
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter: any = { status: 'PUBLISHED' };

    if (category && category !== 'ALL') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(String(search), 'i') },
        { content: new RegExp(String(search), 'i') },
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch blogs.' });
  }
});

// Single blog by slug: GET /api/blog/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: 'PUBLISHED' });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }

    const related = await Blog.find({
      status: 'PUBLISHED',
      _id: { $ne: blog._id },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.json({
      success: true,
      data: {
        blog,
        related,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load blog article.' });
  }
});

export default router;
