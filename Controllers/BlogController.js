import Blog from '../models/Blog.js';

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    const { title, content, author, categories, tags, image, summary, blogType } = req.body;
    const blog = new Blog({ title, content, author, categories, tags, image, summary, blogType });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ error: 'Error creating blog post' });
  }
};

// Get all blog posts
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching blogs' });
  }
};

// Get a single blog post by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching blog' });
  }
};

// Delete a blog post by ID
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting blog' });
  }
};

// Edit an existing blog post
export const editBlog = async (req, res) => {
    try {
      const { title, content, author, categories, tags, image, summary, blogType } = req.body;
      const blog = await Blog.findByIdAndUpdate(
        req.params.id, 
        { title, content, author, categories, tags, image, summary, blogType }, 
        { new: true } // Return the updated blog
      );
      
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
      res.status(200).json(blog);
    } catch (error) {
      res.status(400).json({ error: 'Error updating blog post' });
    }
  };
  