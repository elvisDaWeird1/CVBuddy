export const applicantProfile = {
  fullName: 'Alex Sterling',
  initials: 'AS',
  email: 'alex.sterling@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  headline: 'UX/UI Designer & Front-End Developer',
  summary:
    'Passionate UX/UI Designer with a strong foundation in front-end development. I create digital experiences that are visually polished, accessible, and easy to use, pairing user-centered design with clean implementation.',
  careerGoal:
    'Grow into a product design role where I can build thoughtful tools for early-career professionals and collaborate closely with engineering teams.',
  university: 'California College of the Arts',
  major: 'Bachelor of Fine Arts in Interaction Design',
  portfolioUrl: 'portfolio.alexsterling.design',
  resumeName: 'Alex_Sterling_Resume.pdf',
  resumeUpdated: 'Updated 2 days ago',
  availability: ['Open to Work', 'Full-time, Remote'],
  skills: ['UI Design', 'UX Research', 'Figma', 'HTML/CSS', 'React', 'Tailwind', 'Prototyping'],
} as const

export const experienceItems = [
  {
    role: 'Product Designer',
    company: 'TechFlow Solutions',
    dates: 'Jan 2022 - Present',
    bullets: [
      'Led the redesign of the core SaaS platform, increasing user retention by 15%.',
      'Built reusable interface patterns for forms, dashboards, and onboarding.',
      'Collaborated with engineers to keep production UI aligned with design intent.',
    ],
  },
  {
    role: 'Junior UI Designer',
    company: 'Creative Digital Agency',
    dates: 'Jun 2020 - Dec 2021',
    bullets: [
      'Designed wireframes, mockups, and prototypes for e-commerce and fintech clients.',
      'Supported user research sessions and synthesized findings into product improvements.',
    ],
  },
] as const

export const educationItems = [
  {
    degree: applicantProfile.major,
    school: applicantProfile.university,
    dates: 'Graduated 2020',
    note: 'GPA: 3.8/4.0',
  },
] as const
