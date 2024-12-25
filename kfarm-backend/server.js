const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

// Create uploads directory with absolute path
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the absolute path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/KFarm', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Session configuration - MUST be before other middleware
app.use(session({
  secret: '1fb422043bc5e42db4f94aa7445b3ca5b5e46c1250fcd4a384dc9f2750274b58',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/KFarm',
    ttl: 60 * 60 // Session TTL (1 hour)
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    sameSite: 'lax'
  }
}));

// Add session check middleware
const checkSession = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Check if session is expired
    const now = new Date().getTime();
    const sessionStart = new Date(req.session.cookie._expires).getTime();
    
    if (now > sessionStart) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        return res.status(440).json({ error: 'Session expired' });
      });
      return;
    }
  }
  next();
};

app.use(checkSession);

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profilePicture: { type: String },
  language: { type: String, default: 'en' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  description: { type: String },
  city: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  category: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., kg, pieces, bunches
  available: { type: Boolean, default: true }
});

// FarmInput Schema
const farmInputSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    description: { type: String },
    category: { 
        type: String, 
        required: true,
        enum: ['Seeds', 'Fertilizers', 'Tools', 'Pesticides']
    },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    available: { type: Boolean, default: true },
    discountEligible: { type: Boolean, default: false },
    discountThreshold: { type: Number }, // Minimum quantity for discount
    discountPercentage: { type: Number }, // Percentage off for bulk orders
    specifications: {
        brand: String,
        manufacturer: String,
        applicationMethod: String,
        safetyInstructions: String,
        storageInstructions: String
    }
});

// Add Forum Post Schema after other schemas
const forumPostSchema = new mongoose.Schema({
    category: { 
        type: String, 
        required: true,
        enum: ['crop farming', 'pest control', 'market trends', 'uncategorized']
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FarmingGuideSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Assuming you have a User model
  },
});


const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const FarmInput = mongoose.model('FarmInput', farmInputSchema);
const ForumPost = mongoose.model('ForumPost', forumPostSchema);
const FarmingGuide = mongoose.model('FarmingGuide', FarmingGuideSchema);


// API Route to get guides by crop
app.get('/api/guides/:crop', async (req, res) => {
  try {
    const crop = req.params.crop;

    // Check if crop exists in the database
    const guides = await FarmingGuide.find({ crop });
    if (guides.length === 0) {
      return res.status(404).json({ message: 'No guides found for this crop' });
    }

    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guides', error: err });
  }
});

// API Route to get all crops (distinct list of crop names)
app.get('/api/crops', async (req, res) => {
  try {
    const crops = await FarmingGuide.distinct('crop');

    if (crops.length === 0) {
      // If no crops are found, respond with an empty array
      return res.json([]);
    }

    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching crops', error: err });
  }
});

// API Route to add a new guide for a crop
app.post('/api/guides', async (req, res) => {
  const { crop, title, content, userId } = req.body;

  if (!crop || !title || !content) {
    return res.status(400).json({ message: 'All fields (crop, title, content) are required' });
  }

  try {
    const newGuide = new FarmingGuide({ crop, title, content, userId });
    const savedGuide = await newGuide.save();
    res.status(201).json(savedGuide);
  } catch (err) {
    res.status(500).json({ message: 'Error adding guide', error: err.message });
  }
});

// Edit guide
app.put('/api/guides/:id', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please log in to edit guides' });
  }

  try {
    const guide = await FarmingGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    if (guide.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this guide' });
    }

    const { crop, title, content } = req.body;
    guide.crop = crop || guide.crop;
    guide.title = title || guide.title;
    guide.content = content || guide.content;

    const updatedGuide = await guide.save();
    res.status(200).json(updatedGuide);
  } catch (err) {
    res.status(500).json({ error: `Error updating guide with ID: ${req.params.id}`, message: err.message });
  }
});

// Delete guide
app.delete('/api/guides/:id', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please log in to delete guides' });
  }

  try {
    const guide = await FarmingGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    if (guide.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this guide' });
    }

    await FarmingGuide.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: `Guide with ID: ${req.params.id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: `Error deleting guide with ID: ${req.params.id}`, message: err.message });
  }
});


// Route to create a new user
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Route to handle user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    // Store user information in session
    req.session.userId = user._id;
    req.session.email = user.email; // Add more session data
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Error saving session' });
      }
      
      console.log('Session saved successfully');
      console.log('Session data:', req.session);
      
      // Send response with cookie settings visible
      res.status(200).json({ 
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});


// Route to update user settings
app.put('/api/settings', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Received settings update request');
    console.log('Session:', req.session);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const userId = req.session.userId;
    console.log('User ID from session:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }

    const { name, email, phone, language } = req.body;
    let notifications = req.body.notifications;

    console.log('Received data:', { name, email, phone, language, notifications });

    // Validate input fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Parse notifications if it's a string
    try {
      if (typeof notifications === 'string') {
        notifications = JSON.parse(notifications);
      }
    } catch (error) {
      console.error('Error parsing notifications:', error);
      notifications = undefined;
    }

    // Construct update data
    const updateData = {
      name,
      email,
      phone: phone || undefined,
      language: language || undefined,
      notifications
    };

    // If a new profile picture is uploaded, add it to the update data
    if (req.file) {
      const relativePath = 'uploads/' + req.file.filename;
      updateData.profilePicture = relativePath;
      console.log('Profile picture path:', relativePath);
    }

    console.log('Final update data:', updateData);

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found.' });
    }

    const responseData = {
      message: 'Settings updated successfully',
      user: {
        ...updatedUser.toObject(),
        profilePicture: updatedUser.profilePicture ? `http://localhost:${PORT}/${updatedUser.profilePicture}` : null
      }
    };

    console.log('Sending response:', responseData);
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in settings update:', error);
    console.error('Error stack:', error.stack);

    // Send a proper JSON response even for server errors
    res.status(500).json({
      error: 'Server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route to get current user information
app.get('/api/currentuser', async (req, res) => {
  console.log('Current session:', req.session);

  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'No session found - please log in' });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert user to object and handle profile picture URL
    const userObject = user.toObject();
    if (userObject.profilePicture) {
      userObject.profilePicture = `http://localhost:${PORT}/${userObject.profilePicture}`;
    }

    res.status(200).json(userObject);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Product Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ available: true })
      .populate('farmer', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Add new product
app.post('/api/products', upload.single('image'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to add products' });
  }

  try {
    const { name, price, description, city, category, quantity, unit } = req.body;
    
    const product = new Product({
      name,
      price: parseFloat(price),
      farmer: req.session.userId,
      description,
      city,
      category,
      quantity: parseInt(quantity),
      unit,
      image: req.file ? `uploads/${req.file.filename}` : null
    });

    await product.save();
    
    // Populate farmer details before sending response
    const populatedProduct = await Product.findById(product._id)
      .populate('farmer', 'name email phone');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Error adding product' });
  }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to update products' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.farmer.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = `uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('farmer', 'name email phone');

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to delete products' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if the user is the owner of the product
    if (product.farmer.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    // Delete the product's image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, product.image);
      try {
        await fs.promises.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// FarmInputs Routes

// Get all farm inputs
app.get('/api/farminputs', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category, available: true } : { available: true };
        
        const farmInputs = await FarmInput.find(query)
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(farmInputs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching farm inputs' });
    }
});

// Get farm inputs by category
app.get('/api/farminputs/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const farmInputs = await FarmInput.find({ 
            category, 
            available: true 
        })
        .populate('seller', 'name email phone')
        .sort({ createdAt: -1 });
        
        res.status(200).json(farmInputs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching farm inputs for category' });
    }
});

// Add new farm input
app.post('/api/farminputs', upload.single('image'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to add farm inputs' });
    }

    try {
        const { 
            name, 
            price, 
            description, 
            category,
            quantity,
            unit,
            discountEligible,
            discountThreshold,
            discountPercentage,
            specifications 
        } = req.body;

        const farmInput = new FarmInput({
            name,
            price: parseFloat(price),
            seller: req.session.userId,
            description,
            category,
            quantity: parseInt(quantity),
            unit,
            image: req.file ? `uploads/${req.file.filename}` : null,
            discountEligible: discountEligible === 'true',
            discountThreshold: discountThreshold ? parseInt(discountThreshold) : undefined,
            discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
            specifications: specifications ? JSON.parse(specifications) : undefined
        });

        await farmInput.save();
        
        const populatedFarmInput = await FarmInput.findById(farmInput._id)
            .populate('seller', 'name email phone');

        res.status(201).json(populatedFarmInput);
    } catch (error) {
        console.error('Error adding farm input:', error);
        res.status(500).json({ error: 'Error adding farm input' });
    }
});

// Update farm input
app.put('/api/farminputs/:id', upload.single('image'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to update farm inputs' });
    }

    try {
        const farmInput = await FarmInput.findById(req.params.id);
        if (!farmInput) {
            return res.status(404).json({ error: 'Farm input not found' });
        }

        if (farmInput.seller.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Not authorized to update this farm input' });
        }

        const updates = { ...req.body };
        if (req.file) {
            updates.image = `uploads/${req.file.filename}`;
        }

        // Parse specific fields
        if (updates.price) updates.price = parseFloat(updates.price);
        if (updates.quantity) updates.quantity = parseInt(updates.quantity);
        if (updates.discountThreshold) updates.discountThreshold = parseInt(updates.discountThreshold);
        if (updates.discountPercentage) updates.discountPercentage = parseFloat(updates.discountPercentage);
        if (updates.specifications) updates.specifications = JSON.parse(updates.specifications);

        const updatedFarmInput = await FarmInput.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('seller', 'name email phone');

        res.status(200).json(updatedFarmInput);
    } catch (error) {
        res.status(500).json({ error: 'Error updating farm input' });
    }
});

// Delete farm input
app.delete('/api/farminputs/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to delete farm inputs' });
    }

    try {
        const farmInput = await FarmInput.findById(req.params.id);
        if (!farmInput) {
            return res.status(404).json({ error: 'Farm input not found' });
        }

        if (farmInput.seller.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this farm input' });
        }

        await FarmInput.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Farm input deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting farm input' });
    }
});

// Add Forum Routes after other routes

// Get all forum posts
app.get('/api/forum/posts', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category && category !== 'all' ? { category } : {};
        
        const posts = await ForumPost.find(query)
            .populate('author', 'name')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });
        
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching forum posts' });
    }
});

// Create new forum post
app.post('/api/forum/posts', async (req, res) => {
    const { title, content, category } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const newPost = new ForumPost({
            title,
            content,
            category,
            author: userId,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error creating post:', error); // Log the error
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Add comment to post
app.post('/api/forum/posts/:postId/comments', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to comment' });
    }

    try {
        const { content } = req.body;
        const post = await ForumPost.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments.push({
            author: req.session.userId,
            content
        });

        await post.save();
        
        const updatedPost = await ForumPost.findById(post._id)
            .populate('author', 'name')
            .populate('comments.author', 'name');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Error adding comment' });
    }
});

// Like/Unlike post
app.post('/api/forum/posts/:postId/like', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to like posts' });
    }

    try {
        const post = await ForumPost.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.session.userId);
        
        if (likeIndex === -1) {
            post.likes.push(req.session.userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        
        const updatedPost = await ForumPost.findById(post._id)
            .populate('author', 'name')
            .populate('comments.author', 'name');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Error updating post likes' });
    }
});

// Add edit post endpoint after other forum routes
app.put('/api/forum/posts/:postId', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Please log in to edit posts' });
    }

    try {
        const post = await ForumPost.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user is the author of the post
        if (post.author.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        const { title, content, category } = req.body;
        
        post.title = title;
        post.content = content;
        post.category = category;

        await post.save();
        
        const updatedPost = await ForumPost.findById(post._id)
            .populate('author', 'name')
            .populate('comments.author', 'name');

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Error updating post' });
    }
});

// Route to delete a post
app.delete('/api/forum/posts/:postId', async (req, res) => {
    const userId = req.session.userId; // Get user ID from session

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const post = await ForumPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user is the author of the post
        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await ForumPost.findByIdAndDelete(req.params.postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

//Forgot password route
app.post("/api/forgotpassword", async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user exists
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.status(404).json({ error: "User does not exist!" });
    }

    // Create JWT token
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `http://localhost:5173/resetpassword/${token}`;

    // Set up the email transporter
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lenoxrandy@gmail.com",
        pass: "wjeufuptewfpaizc", // Make sure this password is correct or use an app-specific password
      },
    });

    // Set up email options
    var mailOptions = {
      from: "lenoxrandy@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `Click the link below to reset your password: <a href="${link}">Click Here</a>`,  // Using HTML for clickable link
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "Password reset instructions have been sent to your email.",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});


// Reset Password Route
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    // Decode the token to extract the user ID
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.id) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const oldUser = await User.findOne({ _id: decoded.id });
    if (!oldUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const secret = JWT_SECRET + oldUser.password;

    // Verify the token with the secret
    jwt.verify(token, secret);

    // Encrypt the new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne(
      { _id: oldUser._id },
      { $set: { password: encryptedPassword } }
    );

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

//send a massage
app.post('/api/sendemail', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a transporter object using your SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lenoxrandy@gmail.com',
        pass: 'wjeufuptewfpaizc', // Use an app-specific password if 2FA is enabled
      },
    });

    // Define email options
    const mailOptions = {
      from: email,
      to: 'lenoxrandy@gmail.com', // Replace with your email address
      subject: `New Message from ${name}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending message.' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});