const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Mock data
const mockPlans = [
  {
    id: '1',
    name: 'Basic Plan',
    description: 'Perfect for small businesses',
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: '$',
    features: ['feature1', 'feature2'],
    tiers: [
      {
        id: 'tier1',
        name: 'Basic',
        monthlyPrice: 29,
        yearlyPrice: 290,
        currency: '$',
        description: 'Basic tier with essential features',
        features: ['feature1', 'feature2']
      }
    ]
  },
  {
    id: '2',
    name: 'Pro Plan',
    description: 'Great for growing businesses',
    monthlyPrice: 79,
    yearlyPrice: 790,
    currency: '$',
    features: ['feature1', 'feature2', 'feature3'],
    tiers: [
      {
        id: 'tier2',
        name: 'Pro',
        monthlyPrice: 79,
        yearlyPrice: 790,
        currency: '$',
        description: 'Pro tier with advanced features',
        features: ['feature1', 'feature2', 'feature3']
      }
    ]
  }
];

const mockFeatures = [
  {
    id: 'feature1',
    name: 'Basic Feature',
    description: 'Essential functionality',
    category: 'core'
  },
  {
    id: 'feature2',
    name: 'Advanced Feature',
    description: 'Enhanced functionality',
    category: 'premium'
  },
  {
    id: 'feature3',
    name: 'Pro Feature',
    description: 'Professional functionality',
    category: 'enterprise'
  }
];

const mockCategories = [
  {
    id: 'core',
    name: 'Core Features',
    description: 'Essential features'
  },
  {
    id: 'premium',
    name: 'Premium Features',
    description: 'Advanced features'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Features',
    description: 'Professional features'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello World! SaaS Backend is running' });
});

// API routes with /api prefix
app.get('/api/plan-features/plans', (req, res) => {
  res.json(mockPlans);
});

app.get('/api/plan-features/features', (req, res) => {
  res.json(mockFeatures);
});

app.get('/api/plan-features/categories', (req, res) => {
  res.json(mockCategories);
});

app.post('/api/plan-features/features', (req, res) => {
  const newFeature = {
    id: 'new-feature-' + Date.now(),
    ...req.body,
    message: 'Feature created successfully'
  };
  res.status(201).json(newFeature);
});

app.post('/api/plan-features/categories', (req, res) => {
  const newCategory = {
    id: 'new-category-' + Date.now(),
    ...req.body,
    message: 'Category created successfully'
  };
  res.status(201).json(newCategory);
});

app.delete('/api/plan-features/features/:id', (req, res) => {
  res.json({ deletedCount: 1, message: 'Feature deleted successfully' });
});

app.delete('/api/plan-features/categories/:id', (req, res) => {
  res.json({ deletedCount: 1, message: 'Category deleted successfully' });
});

// Also support routes without /api prefix for backward compatibility
app.get('/plan-features/plans', (req, res) => {
  res.json(mockPlans);
});

app.get('/plan-features/features', (req, res) => {
  res.json(mockFeatures);
});

app.get('/plan-features/categories', (req, res) => {
  res.json(mockCategories);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple backend server is running on http://localhost:${port}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/plan-features/plans`);
  console.log(`   GET  /api/plan-features/features`);
  console.log(`   GET  /api/plan-features/categories`);
  console.log(`   POST /api/plan-features/features`);
  console.log(`   POST /api/plan-features/categories`);
  console.log(`   DELETE /api/plan-features/features/:id`);
  console.log(`   DELETE /api/plan-features/categories/:id`);
});
