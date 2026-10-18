export const SITE = {
    name: "Yuki Ward",
    initials: "YW",
    role: "photographer, director, stop motion - camera and art department, film and music",
    description: "Photography, video and stop motion, plus film, TV and music crew work.",
    email: "yuki@example.com",
    availability: "Open to comissions, crew work and collaborations.",
} as const;

export const PUBLIC_NAV = [
    { href: "/photography", label: "photo" },
    { href: "/video", label: "video" },
    { href: "/stop-motion", label: "stop motion" },
    { href: "/about", label: "about" },
    { href: "/contact", label: "contact" },
] as const;

export const SOCIAL_LINKS = [
    { href: "https://instagram.com/", label: "instgram" },
    { href: "https://vimeo.com/", label: "vimeo" },
]