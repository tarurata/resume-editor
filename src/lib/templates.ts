import { Template } from '@/types/resume'

export const templates: Template[] = [
    {
        id: 'ats-clean',
        name: 'ATS Clean',
        description: 'Optimized for Applicant Tracking Systems with clean formatting',
        data: {
            title: 'Software Engineer',
            summary: 'Results-driven software engineer with expertise in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering scalable solutions and leading cross-functional teams.',
            experience: [
                {
                    role: 'Software Engineer',
                    organization: 'Technology Company',
                    location: 'City, State',
                    startDate: '2020-01',
                    endDate: null,
                    bullets: [
                        'Developed and maintained web applications using modern JavaScript frameworks',
                        'Collaborated with cross-functional teams to deliver high-quality software solutions',
                        'Implemented automated testing and continuous integration processes',
                        'Optimized application performance and reduced load times by 30%'
                    ]
                }
            ],
            skills: [
                'JavaScript',
                'Python',
                'React',
                'Node.js',
                'SQL',
                'Git',
                'Agile',
                'Problem Solving',
                'Team Collaboration',
                'Communication'
            ]
        }
    },
    {
        id: 'compact',
        name: 'Compact',
        description: 'Space-efficient format perfect for experienced professionals',
        data: {
            title: 'Senior Software Engineer',
            summary: 'Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, user experience, and mentoring junior developers.',
            experience: [
                {
                    role: 'Senior Software Engineer',
                    organization: 'TechCorp Inc.',
                    location: 'San Francisco, CA',
                    startDate: '2021-03',
                    endDate: null,
                    bullets: [
                        'Led development of microservices architecture serving 1M+ daily active users',
                        'Improved application performance by 40% through code optimization and caching strategies',
                        'Mentored 3 junior developers and established code review best practices',
                        'Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes'
                    ]
                }
            ],
            skills: [
                'JavaScript',
                'TypeScript',
                'React',
                'Node.js',
                'Python',
                'AWS',
                'Docker',
                'PostgreSQL',
                'MongoDB',
                'Git',
                'Agile/Scrum',
                'RESTful APIs'
            ]
        }
    }
]
