import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';

@Controller('plan-features')
export class MockPlanFeatureController {
  
  @Get('plans')
  async getPlans() {
    // Mock data for plans
    return [
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
  }

  @Get('features')
  async getFeatures() {
    // Mock data for features
    return [
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
  }

  @Get('categories')
  async getCategories() {
    // Mock data for categories
    return [
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
  }

  @Post('features')
  @HttpCode(HttpStatus.CREATED)
  async createFeature(@Body() createFeatureDto: any) {
    return {
      id: 'new-feature-' + Date.now(),
      ...createFeatureDto,
      message: 'Feature created successfully'
    };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: any) {
    return {
      id: 'new-category-' + Date.now(),
      ...createCategoryDto,
      message: 'Category created successfully'
    };
  }

  @Delete('features/:id')
  async deleteFeature(@Param('id') id: string) {
    return { deletedCount: 1, message: 'Feature deleted successfully' };
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return { deletedCount: 1, message: 'Category deleted successfully' };
  }
}
