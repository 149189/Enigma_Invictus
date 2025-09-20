// mockData.js



// Projects
export const mockProjects = [
  {
   id: '1',
    title: 'Community Garden Revival',
    description: 'Transform our neglected neighborhood space into a thriving community garden where families can grow fresh vegetables and children can learn about sustainable farming. This project will provide garden beds, soil, seeds, and basic tools to get started.',
    shortDescription: 'Creating a sustainable community garden for fresh vegetables and education',
    category: 'environment',
    goalAmount: 25000,
    raisedAmount: 18500,
    donorCount: 147,
    daysLeft: 12,
    location: 'Green Valley, Mumbai',
    creatorName: 'Sarah Johnson',
    creatorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    images: [
      'https://images.pexels.com/photos/169523/pexels-photo-169523.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    verified: true,
    featured: true,
    milestones: [
      { id: '1', title: 'Soil Preparation', description: 'Purchase soil and compost', targetAmount: 8000, achieved: true, achievedAt: new Date('2024-01-10') },
      { id: '2', title: 'Garden Beds', description: 'Build raised garden beds', targetAmount: 15000, achieved: true, achievedAt: new Date('2024-01-20') },
      { id: '3', title: 'Seeds & Tools', description: 'Buy seeds and gardening tools', targetAmount: 25000, achieved: false }
    ],
    impactMetrics: [
      { label: 'Families Served', value: 25, unit: 'families', icon: 'Users' },
      { label: 'Garden Beds', value: 12, unit: 'beds', icon: 'Sprout' },
      { label: 'Tree Saplings', value: 8, unit: 'trees', icon: 'Tree' }
    ],
    updates: [
      {
        id: '1',
        title: 'Garden beds construction completed!',
        content: 'We have successfully built 12 raised garden beds with the help of amazing volunteers.',
        images: ['https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=600'],
        createdAt: new Date('2024-01-22')
      }
    ],
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'School Library Restoration',
    description:
      'Our local primary school library needs urgent restoration. We aim to create a modern, welcoming space with new books, furniture, and digital resources that will inspire a love of reading in our children.',
    shortDescription: 'Modernizing our school library with new books and resources',
    category: 'education',
    goalAmount: 40000,
    raisedAmount: 32000,
    donorCount: 203,
    daysLeft: 8,
    location: 'Sunshine School, Delhi',
    creatorName: 'Raj Patel',
    creatorAvatar:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    images: [
      'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    verified: true,
    featured: true,
    milestones: [
      {
        id: '1',
        title: 'Books Purchase',
        description: '500 new books for different age groups',
        targetAmount: 20000,
        achieved: true,
        achievedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Furniture',
        description: 'Reading tables and comfortable chairs',
        targetAmount: 30000,
        achieved: true,
        achievedAt: new Date('2024-01-25'),
      },
      {
        id: '3',
        title: 'Digital Corner',
        description: 'Tablets and educational software',
        targetAmount: 40000,
        achieved: false,
      },
    ],
    impactMetrics: [
      { label: 'Students Benefited', value: 480, unit: 'students', icon: 'GraduationCap' },
      { label: 'New Books', value: 500, unit: 'books', icon: 'Book' },
      { label: 'Reading Hours', value: 1200, unit: 'hours/week', icon: 'Clock' },
    ],
    updates: [
      {
        id: '1',
        title: 'New furniture installed!',
        content: 'The library now has comfortable reading nooks and study areas for students.',
        images: [
          'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=600',
        ],
        createdAt: new Date('2024-01-28'),
      },
    ],
    createdAt: new Date('2023-12-15'),
  },
  {
    id: '3',
    title: 'Medical Emergency Fund',
    description:
      'Supporting local families facing medical emergencies who cannot afford treatment. Every small donation helps cover medical bills, medicines, and essential care for those in our community who need it most.',
    shortDescription: 'Emergency medical support for families in financial crisis',
    category: 'emergency',
    goalAmount: 100000,
    raisedAmount: 67000,
    donorCount: 389,
    daysLeft: 5,
    location: 'City Hospital, Bangalore',
    creatorName: 'Dr. Meera Singh',
    creatorAvatar:
      'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    images: [
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    verified: true,
    featured: false,
    milestones: [
      {
        id: '1',
        title: 'Initial Support',
        description: 'Help 10 families with immediate needs',
        targetAmount: 30000,
        achieved: true,
        achievedAt: new Date('2024-01-05'),
      },
      {
        id: '2',
        title: 'Extended Care',
        description: 'Support 20 more families',
        targetAmount: 60000,
        achieved: true,
        achievedAt: new Date('2024-01-18'),
      },
      {
        id: '3',
        title: 'Full Coverage',
        description: 'Comprehensive medical support',
        targetAmount: 100000,
        achieved: false,
      },
    ],
    impactMetrics: [
      { label: 'Families Helped', value: 23, unit: 'families', icon: 'Heart' },
      { label: 'Medical Procedures', value: 15, unit: 'procedures', icon: 'Activity' },
      { label: 'Days of Care', value: 180, unit: 'days', icon: 'Calendar' },
    ],
    updates: [],
    createdAt: new Date('2023-12-20'),
  },
];

// User
export const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@email.com',
  avatar:
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  totalDonated: 2450,
  donationCount: 12,
  followedProjects: ['1', '2'],
  donationHistory: [
    {
      id: '1',
      projectId: '1',
      projectTitle: 'Community Garden Revival',
      amount: 500,
      date: new Date('2024-01-15'),
      message: 'Great initiative for our community!',
    },
    {
      id: '2',
      projectId: '2',
      projectTitle: 'School Library Restoration',
      amount: 1000,
      date: new Date('2024-01-20'),
      message: 'Education is the future',
    },
    {
      id: '3',
      projectId: '3',
      projectTitle: 'Medical Emergency Fund',
      amount: 950,
      date: new Date('2024-01-25'),
    },
  ],
};
