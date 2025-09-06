import express from 'express';
import { createBlog, getBlogs, getBlogById, deleteBlog, editBlog, getBlogBySlug } from '../Controllers/BlogController.js';

const router = express.Router();

// Route for creating a new blog post
router.post('/', createBlog);

// Route for fetching all blog posts
router.get('/', getBlogs);

// ✅ Get a blog by Slug (SEO friendly)
router.get('/:slug', getBlogBySlug);

// Route for fetching a single blog post by ID
router.get('/:id', getBlogById);

// Route for deleting a blog post by ID
router.delete('/:id', deleteBlog);

// Route for editing a blog post by ID
router.put('/:id', editBlog);

export default router;
