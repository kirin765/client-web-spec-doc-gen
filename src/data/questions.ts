// questions — 6단계 위저드 질문 플로우 정의 (basics, scale, features, design, integration, timeline).

import type { QuestionCategory } from '@/types';

export const questionCategories: QuestionCategory[] = [
  // ---------------------------------------------------------------------------
  // Step 1: 프로젝트 기본 정보
  // ---------------------------------------------------------------------------
  {
    id: 'basics',
    labelKey: 'steps.basics',
    icon: 'FileText',
    questions: [
      {
        id: 'siteType',
        categoryId: 'basics',
        type: 'single-select',
        labelKey: 'questions.siteType.label',
        descriptionKey: 'questions.siteType.description',
        options: [
          {
            id: 'landing',
            labelKey: 'questions.siteType.options.landing',
            descriptionKey: 'questions.siteType.options.landingDesc',
            icon: 'Zap',
            pricingImpact: { type: 'base', value: 0, category: '기본' },
          },
          {
            id: 'brochure',
            labelKey: 'questions.siteType.options.brochure',
            descriptionKey: 'questions.siteType.options.brochureDesc',
            icon: 'FileText',
            pricingImpact: { type: 'base', value: 1, category: '기본' },
          },
          {
            id: 'ecommerce',
            labelKey: 'questions.siteType.options.ecommerce',
            descriptionKey: 'questions.siteType.options.ecommerceDesc',
            icon: 'ShoppingCart',
            pricingImpact: { type: 'base', value: 2, category: '기본' },
          },
          {
            id: 'webapp',
            labelKey: 'questions.siteType.options.webapp',
            descriptionKey: 'questions.siteType.options.webappDesc',
            icon: 'Cpu',
            pricingImpact: { type: 'base', value: 3, category: '기본' },
          },
          {
            id: 'blog',
            labelKey: 'questions.siteType.options.blog',
            descriptionKey: 'questions.siteType.options.blogDesc',
            icon: 'BookOpen',
            pricingImpact: { type: 'base', value: 4, category: '기본' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'projectName',
        categoryId: 'basics',
        type: 'text-input',
        labelKey: 'questions.projectName.label',
        descriptionKey: 'questions.projectName.description',
        validation: { required: true },
        pricingImpact: { type: 'add', value: 0, category: '기본' },
      },
      {
        id: 'targetAudience',
        categoryId: 'basics',
        type: 'text-input',
        labelKey: 'questions.targetAudience.label',
        descriptionKey: 'questions.targetAudience.description',
        validation: { required: false },
        pricingImpact: { type: 'add', value: 0, category: '기본' },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 2: 규모 및 페이지
  // ---------------------------------------------------------------------------
  {
    id: 'scale',
    labelKey: 'steps.scale',
    icon: 'Layers',
    questions: [
      {
        id: 'expectedPages',
        categoryId: 'scale',
        type: 'range-slider',
        labelKey: 'questions.expectedPages.label',
        descriptionKey: 'questions.expectedPages.description',
        validation: { required: true, min: 1, max: 50 },
        pricingImpact: { type: 'add', value: 0, category: '규모' },
      },
      {
        id: 'requiredPages',
        categoryId: 'scale',
        type: 'multi-select',
        labelKey: 'questions.requiredPages.label',
        descriptionKey: 'questions.requiredPages.description',
        options: [
          {
            id: 'home',
            labelKey: 'questions.requiredPages.options.home',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'about',
            labelKey: 'questions.requiredPages.options.about',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'services',
            labelKey: 'questions.requiredPages.options.services',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'portfolio',
            labelKey: 'questions.requiredPages.options.portfolio',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'contact',
            labelKey: 'questions.requiredPages.options.contact',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'blog',
            labelKey: 'questions.requiredPages.options.blog',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'productList',
            labelKey: 'questions.requiredPages.options.productList',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'productDetail',
            labelKey: 'questions.requiredPages.options.productDetail',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'cart',
            labelKey: 'questions.requiredPages.options.cart',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'checkout',
            labelKey: 'questions.requiredPages.options.checkout',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'dashboard',
            labelKey: 'questions.requiredPages.options.dashboard',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'faq',
            labelKey: 'questions.requiredPages.options.faq',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
          {
            id: 'login',
            labelKey: 'questions.requiredPages.options.login',
            pricingImpact: { type: 'add', value: 0, category: '규모' },
          },
        ],
        validation: { required: false },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 3: 기능 요구사항
  // ---------------------------------------------------------------------------
  {
    id: 'features',
    labelKey: 'steps.features',
    icon: 'Puzzle',
    questions: [
      {
        id: 'coreFeatures',
        categoryId: 'features',
        type: 'multi-select',
        labelKey: 'questions.coreFeatures.label',
        descriptionKey: 'questions.coreFeatures.description',
        options: [
          {
            id: 'contactForm',
            labelKey: 'questions.coreFeatures.options.contactForm',
            pricingImpact: { type: 'add', value: 0, category: '기능' },
          },
          {
            id: 'search',
            labelKey: 'questions.coreFeatures.options.search',
            pricingImpact: { type: 'add', value: 500_000, category: '기능' },
          },
          {
            id: 'auth',
            labelKey: 'questions.coreFeatures.options.auth',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'payment',
            labelKey: 'questions.coreFeatures.options.payment',
            pricingImpact: { type: 'add', value: 2_000_000, category: '기능' },
          },
          {
            id: 'adminPanel',
            labelKey: 'questions.coreFeatures.options.adminPanel',
            pricingImpact: { type: 'add', value: 2_000_000, category: '기능' },
          },
          {
            id: 'fileUpload',
            labelKey: 'questions.coreFeatures.options.fileUpload',
            pricingImpact: { type: 'add', value: 500_000, category: '기능' },
          },
          {
            id: 'chat',
            labelKey: 'questions.coreFeatures.options.chat',
            pricingImpact: { type: 'add', value: 1_500_000, category: '기능' },
          },
          {
            id: 'socialIntegration',
            labelKey: 'questions.coreFeatures.options.socialIntegration',
            pricingImpact: { type: 'add', value: 300_000, category: '기능' },
          },
          {
            id: 'multiLanguage',
            labelKey: 'questions.coreFeatures.options.multiLanguage',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'analyticsDashboard',
            labelKey: 'questions.coreFeatures.options.analyticsDashboard',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'booking',
            labelKey: 'questions.coreFeatures.options.booking',
            pricingImpact: { type: 'add', value: 2_000_000, category: '기능' },
          },
          {
            id: 'mapIntegration',
            labelKey: 'questions.coreFeatures.options.mapIntegration',
            pricingImpact: { type: 'add', value: 300_000, category: '기능' },
          },
        ],
        validation: { required: false },
      },
      {
        id: 'ecommerceFeatures',
        categoryId: 'features',
        type: 'multi-select',
        labelKey: 'questions.ecommerceFeatures.label',
        descriptionKey: 'questions.ecommerceFeatures.description',
        options: [
          {
            id: 'productManagement',
            labelKey: 'questions.ecommerceFeatures.options.productManagement',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'inventory',
            labelKey: 'questions.ecommerceFeatures.options.inventory',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'orderTracking',
            labelKey: 'questions.ecommerceFeatures.options.orderTracking',
            pricingImpact: { type: 'add', value: 1_000_000, category: '기능' },
          },
          {
            id: 'couponSystem',
            labelKey: 'questions.ecommerceFeatures.options.couponSystem',
            pricingImpact: { type: 'add', value: 500_000, category: '기능' },
          },
          {
            id: 'reviewSystem',
            labelKey: 'questions.ecommerceFeatures.options.reviewSystem',
            pricingImpact: { type: 'add', value: 500_000, category: '기능' },
          },
        ],
        conditionalOn: {
          questionId: 'siteType',
          values: ['ecommerce'],
        },
        validation: { required: false },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 4: 디자인
  // ---------------------------------------------------------------------------
  {
    id: 'design',
    labelKey: 'steps.design',
    icon: 'Palette',
    questions: [
      {
        id: 'designComplexity',
        categoryId: 'design',
        type: 'single-select',
        labelKey: 'questions.designComplexity.label',
        descriptionKey: 'questions.designComplexity.description',
        options: [
          {
            id: 'template',
            labelKey: 'questions.designComplexity.options.template',
            descriptionKey: 'questions.designComplexity.options.templateDesc',
            icon: 'Square',
            pricingImpact: { type: 'multiply', value: 1.0, category: '디자인' },
          },
          {
            id: 'custom',
            labelKey: 'questions.designComplexity.options.custom',
            descriptionKey: 'questions.designComplexity.options.customDesc',
            icon: 'Palette',
            pricingImpact: { type: 'multiply', value: 1.3, category: '디자인' },
          },
          {
            id: 'premium',
            labelKey: 'questions.designComplexity.options.premium',
            descriptionKey: 'questions.designComplexity.options.premiumDesc',
            icon: 'Sparkles',
            pricingImpact: { type: 'multiply', value: 1.6, category: '디자인' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'responsiveTargets',
        categoryId: 'design',
        type: 'multi-select',
        labelKey: 'questions.responsiveTargets.label',
        descriptionKey: 'questions.responsiveTargets.description',
        options: [
          {
            id: 'mobile',
            labelKey: 'questions.responsiveTargets.options.mobile',
            icon: 'Smartphone',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
          {
            id: 'tablet',
            labelKey: 'questions.responsiveTargets.options.tablet',
            icon: 'Tablet',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
          {
            id: 'desktop',
            labelKey: 'questions.responsiveTargets.options.desktop',
            icon: 'Monitor',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'designStyle',
        categoryId: 'design',
        type: 'single-select',
        labelKey: 'questions.designStyle.label',
        descriptionKey: 'questions.designStyle.description',
        options: [
          {
            id: 'minimal',
            labelKey: 'questions.designStyle.options.minimal',
            descriptionKey: 'questions.designStyle.options.minimalDesc',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
          {
            id: 'corporate',
            labelKey: 'questions.designStyle.options.corporate',
            descriptionKey: 'questions.designStyle.options.corporateDesc',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
          {
            id: 'creative',
            labelKey: 'questions.designStyle.options.creative',
            descriptionKey: 'questions.designStyle.options.creativeDesc',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
          {
            id: 'luxury',
            labelKey: 'questions.designStyle.options.luxury',
            descriptionKey: 'questions.designStyle.options.luxuryDesc',
            pricingImpact: { type: 'add', value: 0, category: '디자인' },
          },
        ],
        validation: { required: true },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 5: 콘텐츠 및 연동
  // ---------------------------------------------------------------------------
  {
    id: 'integration',
    labelKey: 'steps.integration',
    icon: 'Link',
    questions: [
      {
        id: 'contentDelivery',
        categoryId: 'integration',
        type: 'single-select',
        labelKey: 'questions.contentDelivery.label',
        descriptionKey: 'questions.contentDelivery.description',
        options: [
          {
            id: 'clientProvides',
            labelKey: 'questions.contentDelivery.options.clientProvides',
            descriptionKey: 'questions.contentDelivery.options.clientProvidesDesc',
            pricingImpact: { type: 'add', value: 0, category: '콘텐츠' },
          },
          {
            id: 'needCopywriting',
            labelKey: 'questions.contentDelivery.options.needCopywriting',
            descriptionKey: 'questions.contentDelivery.options.needCopywritingDesc',
            pricingImpact: { type: 'add', value: 1_000_000, category: '콘텐츠' },
          },
          {
            id: 'needMediaProduction',
            labelKey: 'questions.contentDelivery.options.needMediaProduction',
            descriptionKey: 'questions.contentDelivery.options.needMediaProductionDesc',
            pricingImpact: { type: 'add', value: 2_000_000, category: '콘텐츠' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'externalIntegrations',
        categoryId: 'integration',
        type: 'multi-select',
        labelKey: 'questions.externalIntegrations.label',
        descriptionKey: 'questions.externalIntegrations.description',
        options: [
          {
            id: 'googleAnalytics',
            labelKey: 'questions.externalIntegrations.options.googleAnalytics',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'metaPixel',
            labelKey: 'questions.externalIntegrations.options.metaPixel',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'kakaoPay',
            labelKey: 'questions.externalIntegrations.options.kakaoPay',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'tossPay',
            labelKey: 'questions.externalIntegrations.options.tossPay',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'naverPay',
            labelKey: 'questions.externalIntegrations.options.naverPay',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'crmIntegration',
            labelKey: 'questions.externalIntegrations.options.crmIntegration',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
          {
            id: 'externalApi',
            labelKey: 'questions.externalIntegrations.options.externalApi',
            pricingImpact: { type: 'add', value: 300_000, category: '연동' },
          },
        ],
        validation: { required: false },
      },
      {
        id: 'hosting',
        categoryId: 'integration',
        type: 'single-select',
        labelKey: 'questions.hosting.label',
        descriptionKey: 'questions.hosting.description',
        options: [
          {
            id: 'agencyManaged',
            labelKey: 'questions.hosting.options.agencyManaged',
            descriptionKey: 'questions.hosting.options.agencyManagedDesc',
            pricingImpact: { type: 'add', value: 0, category: '호스팅' },
          },
          {
            id: 'selfHosted',
            labelKey: 'questions.hosting.options.selfHosted',
            descriptionKey: 'questions.hosting.options.selfHostedDesc',
            pricingImpact: { type: 'add', value: 0, category: '호스팅' },
          },
          {
            id: 'cloud',
            labelKey: 'questions.hosting.options.cloud',
            descriptionKey: 'questions.hosting.options.cloudDesc',
            pricingImpact: { type: 'add', value: 0, category: '호스팅' },
          },
        ],
        validation: { required: true },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 6: 일정 및 예산
  // ---------------------------------------------------------------------------
  {
    id: 'timeline',
    labelKey: 'steps.timeline',
    icon: 'Clock',
    questions: [
      {
        id: 'desiredTimeline',
        categoryId: 'timeline',
        type: 'single-select',
        labelKey: 'questions.desiredTimeline.label',
        descriptionKey: 'questions.desiredTimeline.description',
        options: [
          {
            id: 'flexible',
            labelKey: 'questions.desiredTimeline.options.flexible',
            descriptionKey: 'questions.desiredTimeline.options.flexibleDesc',
            icon: 'Calendar',
            pricingImpact: { type: 'multiply', value: 1.0, category: '일정' },
          },
          {
            id: 'standard',
            labelKey: 'questions.desiredTimeline.options.standard',
            descriptionKey: 'questions.desiredTimeline.options.standardDesc',
            icon: 'Calendar',
            pricingImpact: { type: 'multiply', value: 1.0, category: '일정' },
          },
          {
            id: 'urgent',
            labelKey: 'questions.desiredTimeline.options.urgent',
            descriptionKey: 'questions.desiredTimeline.options.urgentDesc',
            icon: 'AlertCircle',
            pricingImpact: { type: 'multiply', value: 1.3, category: '일정' },
          },
          {
            id: 'rush',
            labelKey: 'questions.desiredTimeline.options.rush',
            descriptionKey: 'questions.desiredTimeline.options.rushDesc',
            icon: 'Zap',
            pricingImpact: { type: 'multiply', value: 1.6, category: '일정' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'budgetAwareness',
        categoryId: 'timeline',
        type: 'single-select',
        labelKey: 'questions.budgetAwareness.label',
        descriptionKey: 'questions.budgetAwareness.description',
        options: [
          {
            id: 'under500',
            labelKey: 'questions.budgetAwareness.options.under500',
            pricingImpact: { type: 'add', value: 0, category: '예산' },
          },
          {
            id: 'range500to1000',
            labelKey: 'questions.budgetAwareness.options.range500to1000',
            pricingImpact: { type: 'add', value: 0, category: '예산' },
          },
          {
            id: 'range1000to3000',
            labelKey: 'questions.budgetAwareness.options.range1000to3000',
            pricingImpact: { type: 'add', value: 0, category: '예산' },
          },
          {
            id: 'over3000',
            labelKey: 'questions.budgetAwareness.options.over3000',
            pricingImpact: { type: 'add', value: 0, category: '예산' },
          },
          {
            id: 'notSure',
            labelKey: 'questions.budgetAwareness.options.notSure',
            pricingImpact: { type: 'add', value: 0, category: '예산' },
          },
        ],
        validation: { required: true },
      },
      {
        id: 'additionalNotes',
        categoryId: 'timeline',
        type: 'text-input',
        labelKey: 'questions.additionalNotes.label',
        descriptionKey: 'questions.additionalNotes.description',
        validation: { required: false },
        pricingImpact: { type: 'add', value: 0, category: '기타' },
      },
    ],
  },
];
