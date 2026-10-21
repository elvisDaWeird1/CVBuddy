export type TargetRole = { value: string; label: string; isOther?: boolean }
export type Vertical = { slug: string; label: string; targetRoles: TargetRole[] }
export type Industry = { slug: string; label: string; verticals: Vertical[] }

const other: TargetRole = { value: '__other__', label: 'Other / Enter another role', isOther: true }
const roles = (...values: string[]): TargetRole[] => [...values.map((value) => ({ value, label: value })), other]
const vertical = (slug: string, label: string, ...targetRoles: string[]): Vertical => ({ slug, label, targetRoles: roles(...targetRoles) })

// Order mirrors the AI service's INDUSTRY_DISPLAY_ORDER and VERTICAL_DISPLAY_ORDER.
export const CAREER_CATALOG: Industry[] = [
  { slug: 'ai_software', label: 'AI / Software Engineering', verticals: [
    vertical('machine_learning', 'Machine Learning / AI Engineering', 'Machine Learning Intern', 'Junior Machine Learning Engineer', 'AI Engineer', 'MLOps Engineer'),
    vertical('data_science', 'Data Science', 'Data Analyst Intern', 'Junior Data Scientist', 'Data Analyst', 'Business Intelligence Analyst'),
    vertical('computer_vision', 'Computer Vision', 'Computer Vision Intern', 'Junior Computer Vision Engineer', 'Computer Vision Engineer', 'Image Processing Engineer'),
    vertical('nlp', 'Natural Language Processing', 'NLP Intern', 'Junior NLP Engineer', 'NLP Engineer', 'Conversational AI Engineer'),
    vertical('backend_ai', 'Backend / AI Application', 'Backend Developer Intern', 'Junior Backend Developer', 'AI Application Engineer', 'Python Developer'),
  ] },
  { slug: 'computer_science', label: 'Computer Science & IT', verticals: [
    vertical('software_engineering', 'Software Engineering', 'Software Engineer Intern', 'Junior Software Engineer', 'Software Developer', 'QA Engineer'),
    vertical('web_development', 'Web Development', 'Frontend Developer', 'Backend Developer', 'Full-stack Developer', 'Web Developer Intern'),
    vertical('mobile_development', 'Mobile Development', 'Mobile Developer Intern', 'Junior Mobile Developer', 'Android Developer', 'iOS Developer'),
    vertical('data_engineering', 'Data Engineering', 'Data Engineer Intern', 'Junior Data Engineer', 'ETL Developer', 'Database Developer'),
    vertical('cybersecurity', 'Cybersecurity & Digital Safety', 'Cybersecurity Intern', 'Junior Security Analyst', 'SOC Analyst', 'Penetration Testing Intern'),
    vertical('information_systems', 'Information Systems', 'Business Analyst Intern', 'Junior Business Analyst', 'Systems Analyst', 'ERP Consultant'),
    vertical('cloud_devops', 'Cloud / DevOps', 'DevOps Intern', 'Junior DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'),
  ] },
  { slug: 'business_administration', label: 'Business Administration', verticals: [
    vertical('general_business', 'General Business Administration', 'Business Development Intern', 'Management Trainee', 'Operations Executive', 'Project Coordinator'),
    vertical('international_business', 'International Business', 'International Business Intern', 'Import Export Executive', 'Trade Operations Coordinator', 'Sales Operations Analyst'),
    vertical('ecommerce', 'E-Commerce', 'E-Commerce Intern', 'E-Commerce Executive', 'Marketplace Operations Executive', 'Online Merchandising Coordinator'),
    vertical('customer_experience', 'Customer Experience', 'Customer Experience Intern', 'Customer Success Executive', 'Customer Service Representative', 'CRM Executive'),
    vertical('business_analytics', 'Business Analytics', 'Business Analytics Intern', 'Junior Business Analyst', 'Business Intelligence Analyst', 'Reporting Analyst'),
    vertical('logistics_supply_chain', 'Logistics & Supply Chain', 'Logistics Intern', 'Supply Chain Coordinator', 'Inventory Analyst', 'Freight Forwarding Executive'),
    vertical('procurement', 'Procurement & Purchasing', 'Procurement Intern', 'Purchasing Executive', 'Sourcing Analyst', 'Vendor Management Coordinator'),
    vertical('event_management', 'Event Management', 'Event Management Intern', 'Event Coordinator', 'Production Coordinator', 'Sponsorship Executive'),
  ] },
  { slug: 'marketing', label: 'Marketing / Communications', verticals: [
    vertical('digital_marketing', 'Digital Marketing', 'Digital Marketing Intern', 'Digital Marketing Executive', 'SEO Executive', 'Campaign Coordinator'),
    vertical('content_marketing', 'Content Marketing', 'Content Marketing Intern', 'Content Writer', 'Copywriter', 'Editorial Coordinator'),
    vertical('social_media', 'Social Media Marketing', 'Social Media Intern', 'Social Media Executive', 'Community Manager', 'Influencer Marketing Coordinator'),
    vertical('brand_management', 'Brand Management', 'Brand Management Intern', 'Assistant Brand Manager', 'Brand Executive', 'Product Marketing Executive'),
    vertical('performance_marketing', 'Performance Marketing', 'Performance Marketing Intern', 'Paid Media Executive', 'Performance Marketing Executive', 'Growth Marketing Analyst'),
    vertical('public_relations', 'Public Relations', 'Public Relations Intern', 'PR Executive', 'Media Relations Coordinator', 'Communications Executive'),
    vertical('market_research', 'Market Research', 'Market Research Intern', 'Research Executive', 'Consumer Insights Analyst', 'Market Research Analyst'),
  ] },
  { slug: 'finance_banking', label: 'Finance & Banking', verticals: [
    vertical('banking_finance', 'Banking & Finance', 'Banking Intern', 'Credit Analyst', 'Relationship Officer', 'Treasury Analyst'),
    vertical('corporate_finance', 'Corporate Finance', 'Corporate Finance Intern', 'Financial Analyst', 'FP&A Analyst', 'Investment Analyst'),
    vertical('fintech', 'Fintech', 'Fintech Intern', 'Digital Banking Analyst', 'Product Operations Analyst', 'Payments Operations Executive'),
    vertical('smart_finance', 'Smart Finance', 'Quantitative Finance Intern', 'Financial Data Analyst', 'Risk Analyst', 'Investment Operations Analyst'),
  ] },
  { slug: 'hospitality_tourism', label: 'Hospitality & Tourism', verticals: [
    vertical('hospitality_management', 'Hospitality Management', 'Hotel Management Intern', 'Front Office Associate', 'Guest Relations Executive', 'Reservations Agent'),
    vertical('tourism_travel', 'Tourism & Travel Management', 'Tourism Intern', 'Travel Consultant', 'Tour Operations Coordinator', 'Tour Guide'),
    vertical('restaurant_service', 'Restaurant & F&B Service', 'F&B Service Intern', 'Restaurant Supervisor', 'Restaurant Service Associate', 'Banquet Coordinator'),
  ] },
  { slug: 'language', label: 'Languages', verticals: [
    vertical('english_language', 'English Language', 'English Communication Intern', 'English Customer Support Representative', 'English Content Editor', 'Bilingual Sales Coordinator'),
    vertical('chinese_language', 'Chinese Language', 'Chinese Language Intern', 'Chinese Customer Support Representative', 'Chinese Sales Coordinator', 'Mandarin Translator'),
    vertical('japanese_language', 'Japanese Language', 'Japanese Language Intern', 'Japanese Customer Support Representative', 'Japanese Sales Coordinator', 'Japanese Translator'),
    vertical('korean_language', 'Korean Language', 'Korean Language Intern', 'Korean Customer Support Representative', 'Korean Sales Coordinator', 'Korean Translator'),
    vertical('translation_interpretation', 'Translation & Interpretation', 'Translation Intern', 'Translator', 'Interpreter', 'Localization Coordinator'),
    vertical('language_teaching', 'Language Teaching', 'Teaching Assistant', 'ESL Teacher', 'Language Tutor', 'Academic Coordinator'),
  ] },
  { slug: 'law', label: 'Law', verticals: [
    vertical('general_law', 'General, Civil & Criminal Law', 'Legal Intern', 'Paralegal', 'Legal Research Assistant', 'Legal Administrative Assistant'),
    vertical('economic_law', 'Economic & Commercial Law', 'Corporate Legal Intern', 'Compliance Analyst', 'Contract Administrator', 'Legal Counsel Assistant'),
  ] },
]

export const getIndustry = (slug?: string) => CAREER_CATALOG.find((industry) => industry.slug === slug)
export const getVertical = (industrySlug?: string, verticalSlug?: string) => getIndustry(industrySlug)?.verticals.find((vertical) => vertical.slug === verticalSlug)
export const formatCareerContext = (industrySlug?: string, verticalSlug?: string, targetRole?: string) => [getIndustry(industrySlug)?.label, getVertical(industrySlug, verticalSlug)?.label, targetRole].filter(Boolean).join(' · ')
