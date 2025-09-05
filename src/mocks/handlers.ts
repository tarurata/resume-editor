import { http, HttpResponse } from 'msw'

export const handlers = [
    // Mock API endpoint for edit preview
    http.post('/api/edit/preview', async ({ request }) => {
        const body = await request.json() as {
            sectionId: string
            presetId: string
            currentContent: string
            jdText: string
        }

        const { sectionId, presetId, currentContent, jdText } = body

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Generate mock suggestions based on section and preset
        let suggestion = currentContent

        if (sectionId === 'title') {
            if (presetId === 'extract-from-jd') {
                // Extract title from JD (simple mock)
                const titleMatch = jdText.match(/(?:looking for|seeking|hiring)\s+([^.!?]+)/i)
                suggestion = titleMatch ? titleMatch[1].trim() : 'Software Engineer'
            }
        } else if (sectionId === 'summary') {
            if (presetId === 'rewrite-short') {
                suggestion = 'Experienced full-stack developer with 5+ years building scalable applications. Expert in React, Node.js, and cloud technologies. Passionate about clean code and user experience.'
            } else if (presetId === 'rewrite-medium') {
                suggestion = 'Results-driven software engineer with 5+ years of experience in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering scalable solutions and leading cross-functional teams. Passionate about clean code, user experience, and mentoring junior developers.'
            } else if (presetId === 'match-jd') {
                suggestion = 'Results-driven software engineer with expertise in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering scalable solutions and leading cross-functional teams.'
            }
        } else if (sectionId.startsWith('experience-')) {
            if (presetId === 'quantify') {
                suggestion = '• Led development of microservices architecture serving 1M+ daily active users\n• Improved application performance by 40% through code optimization and caching strategies\n• Mentored 3 junior developers and established code review best practices\n• Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes'
            } else if (presetId === 'action-verbs') {
                suggestion = '• Architected and developed microservices serving 1M+ users\n• Optimized application performance by 40%\n• Mentored 3 junior developers and established best practices\n• Streamlined CI/CD pipelines reducing deployment time by 87%'
            } else if (presetId === 'achievements') {
                suggestion = '• Delivered microservices architecture serving 1M+ users with 99.9% uptime\n• Achieved 40% performance improvement through optimization\n• Successfully mentored 3 junior developers to senior level\n• Reduced deployment time by 87% through CI/CD automation'
            }
        } else if (sectionId === 'skills') {
            if (presetId === 'map-jd') {
                // Extract skills from JD (simple mock)
                const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git', 'Agile/Scrum', 'RESTful APIs']
                suggestion = skills.join(', ')
            } else if (presetId === 'categorize') {
                suggestion = 'Frontend: JavaScript, TypeScript, React\nBackend: Node.js, Python, RESTful APIs\nCloud: AWS, Docker\nDatabase: PostgreSQL, MongoDB\nTools: Git, Agile/Scrum'
            } else if (presetId === 'prioritize') {
                suggestion = 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, MongoDB, Git, Agile/Scrum, RESTful APIs'
            }
        }

        return HttpResponse.json({
            suggestion,
            presetId,
            sectionId,
            timestamp: new Date().toISOString()
        })
    }),

    // Mock API endpoint for other edit operations
    http.post('/api/edit/apply', async ({ request }) => {
        const body = await request.json()

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        return HttpResponse.json({
            success: true,
            message: 'Changes applied successfully',
            timestamp: new Date().toISOString()
        })
    })
]
