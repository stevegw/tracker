// Genesis Health Clubs class schedule data
// This file contains all available fitness classes organized by category

const GENESIS_CLASSES_DATA = {
    categories: [
        {
            id: 'high-intensity-cardio',
            name: 'High-Intensity & Cardio',
            icon: '🔥',
            classes: [
                {
                    name: 'All American Training',
                    duration: 60,
                    description: 'High intensity training that combines strength, endurance, and power training while pushing through zones of performance. Features intervals rotated between treadmills, row machines, strap, floor and dumbbell movements.',
                    difficulty: 'advanced',
                    equipment: 'Treadmill, rowing machine, dumbbells, straps'
                },
                {
                    name: 'Group Blast®',
                    duration: 60,
                    description: '60 minutes of cardio training using The STEP® that improves fitness, agility, coordination, and strength.',
                    difficulty: 'intermediate',
                    equipment: 'Step platform'
                },
                {
                    name: 'Group Fight™',
                    duration: 60,
                    description: 'An hour-long class that burns calories and builds total body strength using mixed martial arts movements.',
                    difficulty: 'intermediate',
                    equipment: 'None'
                },
                {
                    name: 'R30',
                    duration: 30,
                    description: 'A 30-minute cycling class that burns calories and improves muscular endurance and cardio fitness.',
                    difficulty: 'intermediate',
                    equipment: 'Stationary bike'
                },
                {
                    name: 'Cycle',
                    duration: 45,
                    description: 'Indoor cycling class with varying intensity levels, music-driven workout that builds endurance and burns calories.',
                    difficulty: 'all-levels',
                    equipment: 'Stationary bike'
                }
            ]
        },
        {
            id: 'mind-body',
            name: 'Mind-Body',
            icon: '🧘',
            classes: [
                {
                    name: 'Barre',
                    duration: 60,
                    description: 'A Pilates-based, full-body workout inspired by traditional ballet barre training that provides high-intensity workout increasing strength, especially in core & legs.',
                    difficulty: 'intermediate',
                    equipment: 'Barre, light weights'
                },
                {
                    name: 'Group Centergy®',
                    duration: 60,
                    description: 'A 60-minute mind-body workout incorporating yoga and Pilates fundamentals with athletic training for balance, mobility, flexibility, and the core.',
                    difficulty: 'beginner',
                    equipment: 'Yoga mat'
                },
                {
                    name: 'Yoga - Vinyasa Flow',
                    duration: 60,
                    description: 'Dynamic flowing yoga style linking breath with movement, builds strength and flexibility while promoting mindfulness.',
                    difficulty: 'intermediate',
                    equipment: 'Yoga mat'
                },
                {
                    name: 'Yoga - Power',
                    duration: 60,
                    description: 'Athletic, vigorous yoga style that builds strength and endurance through challenging poses and sequences.',
                    difficulty: 'advanced',
                    equipment: 'Yoga mat'
                },
                {
                    name: 'Yoga - Restorative',
                    duration: 60,
                    description: 'Gentle, relaxing yoga focused on deep relaxation and stress relief using supported poses.',
                    difficulty: 'beginner',
                    equipment: 'Yoga mat, props'
                },
                {
                    name: 'Yoga - Prenatal',
                    duration: 60,
                    description: 'Specially designed yoga for expectant mothers, focusing on gentle stretches, breathing, and relaxation.',
                    difficulty: 'beginner',
                    equipment: 'Yoga mat'
                }
            ]
        },
        {
            id: 'strength-training',
            name: 'Strength Training',
            icon: '💪',
            classes: [
                {
                    name: 'Group Core®',
                    duration: 30,
                    description: '30 minutes of three-dimensional strength training that improves athletic performance and helps prevent back pain.',
                    difficulty: 'intermediate',
                    equipment: 'Resistance bands, weights'
                },
                {
                    name: 'Group Power®',
                    duration: 60,
                    description: 'One hour of strength training combining traditional strength training with functional exercises using an adjustable barbell, body weight, and music.',
                    difficulty: 'intermediate',
                    equipment: 'Barbell, weights'
                }
            ]
        },
        {
            id: 'dance-group',
            name: 'Dance & Group Fitness',
            icon: '💃',
            classes: [
                {
                    name: 'Group Groove®',
                    duration: 60,
                    description: 'An hour of dance fitness featuring club, urban, and Latin dance styles.',
                    difficulty: 'all-levels',
                    equipment: 'None'
                },
                {
                    name: 'Zumba®',
                    duration: 60,
                    description: 'Latin-inspired dance fitness class with energetic music and easy-to-follow choreography.',
                    difficulty: 'all-levels',
                    equipment: 'None'
                },
                {
                    name: 'Group Active®',
                    duration: 60,
                    description: 'Moderate intensity group fitness class combining cardio and strength training for all fitness levels.',
                    difficulty: 'beginner',
                    equipment: 'Various'
                }
            ]
        },
        {
            id: 'specialty',
            name: 'Specialty Classes',
            icon: '⭐',
            classes: [
                {
                    name: 'Forever Fit',
                    duration: 45,
                    description: 'Low-impact fitness class designed for active older adults focusing on strength, balance, and flexibility.',
                    difficulty: 'beginner',
                    equipment: 'Chair, light weights'
                },
                {
                    name: 'Chair Fitness',
                    duration: 45,
                    description: 'Seated exercise class that improves strength, flexibility, and cardiovascular health using chair support.',
                    difficulty: 'beginner',
                    equipment: 'Chair'
                },
                {
                    name: 'Kids on the Move',
                    duration: 30,
                    description: 'Fun, active class designed for children to develop motor skills, coordination, and fitness through games and activities.',
                    difficulty: 'kids',
                    equipment: 'Various'
                }
            ]
        }
    ]
};
