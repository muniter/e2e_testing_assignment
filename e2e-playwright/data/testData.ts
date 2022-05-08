export const user = {
    password : process.env.GHOST_PASSWORD || 'Very_Strong1!',
    email : process.env.GHOST_EMAIL || 'tester@tester.com'
}

export const site = {
    url: (process.env.GHOST_URL || 'http://localhost:9333').replace(/\/$/, ''),
    ghostTitle: process.env.GHOST_NAME || 'Ghost Testing',
    blogTitle: process.env.GHOST_NAME || 'Ghost Testing'
}

