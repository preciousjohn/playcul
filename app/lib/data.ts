export type ChordFingering = {
  string: number // 1=G (leftmost in diagram), 2=C, 3=E, 4=A (rightmost)
  fret: number
  finger: number // 1=index, 2=middle, 3=ring, 4=pinky
}

export type Chord = {
  id: string
  name: string
  fullName: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  // Fret numbers for [G, C, E, A] strings. 0=open, -1=muted
  fingering: [number, number, number, number]
  fingers: ChordFingering[]
  tip: string
  strumPattern: string
}

export type Song = {
  id: string
  title: string
  artist: string
  difficulty: 'easy' | 'medium'
  chords: string[]
  description: string
  strumPattern: string
}

export const chords: Chord[] = [

  // ─── BEGINNER ────────────────────────────────────────────────────────────────
  {
    id: 'C',
    name: 'C',
    fullName: 'C Major',
    difficulty: 'beginner',
    fingering: [0, 0, 0, 3],
    fingers: [{ string: 4, fret: 3, finger: 3 }],
    tip: 'Place your ring finger on the 3rd fret of the A string. Keep all other fingers curled away — this chord rings beautifully open.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'Am',
    name: 'Am',
    fullName: 'A Minor',
    difficulty: 'beginner',
    fingering: [2, 0, 0, 0],
    fingers: [{ string: 1, fret: 2, finger: 2 }],
    tip: 'Use your middle finger on the 2nd fret of the G string. One finger, four strings ringing — simple and soulful.',
    strumPattern: 'D D D U',
  },
  {
    id: 'F',
    name: 'F',
    fullName: 'F Major',
    difficulty: 'beginner',
    fingering: [2, 0, 1, 0],
    fingers: [
      { string: 3, fret: 1, finger: 1 },
      { string: 1, fret: 2, finger: 2 },
    ],
    tip: 'Index finger on the 1st fret of the E string, middle finger on the 2nd fret of the G string. Keep fingers arched so open strings ring freely.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'G',
    name: 'G',
    fullName: 'G Major',
    difficulty: 'beginner',
    fingering: [0, 2, 3, 2],
    fingers: [
      { string: 4, fret: 2, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 3, fret: 3, finger: 3 },
    ],
    tip: 'Three fingers spread across the fretboard. Practice the C → G transition slowly — it\'s the most common chord change in pop music.',
    strumPattern: 'D D D U',
  },
  {
    id: 'D',
    name: 'D',
    fullName: 'D Major',
    difficulty: 'beginner',
    fingering: [2, 2, 2, 0],
    fingers: [
      { string: 3, fret: 2, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 1, fret: 2, finger: 3 },
    ],
    tip: 'Your index, middle, and ring fingers line up at the 2nd fret across the E, C, and G strings. Some players use a barre with just the index finger.',
    strumPattern: 'D D U D U',
  },
  {
    id: 'Em',
    name: 'Em',
    fullName: 'E Minor',
    difficulty: 'beginner',
    fingering: [0, 4, 3, 2],
    fingers: [
      { string: 4, fret: 2, finger: 1 },
      { string: 3, fret: 3, finger: 2 },
      { string: 2, fret: 4, finger: 3 },
    ],
    tip: 'Index on A string fret 2, middle on E string fret 3, ring on C string fret 4. Stretch the fingers out and let the G string ring open.',
    strumPattern: 'D U D U D U',
  },
  {
    id: 'A',
    name: 'A',
    fullName: 'A Major',
    difficulty: 'beginner',
    fingering: [2, 1, 0, 0],
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 1, fret: 2, finger: 2 },
    ],
    tip: 'Index finger on the C string at fret 1, middle finger on the G string at fret 2. The E and A strings ring open — bright and uplifting.',
    strumPattern: 'D D U U D U',
  },

  // ─── INTERMEDIATE ─────────────────────────────────────────────────────────────
  {
    id: 'G7',
    name: 'G7',
    fullName: 'G Dominant 7',
    difficulty: 'intermediate',
    fingering: [0, 2, 1, 2],
    fingers: [
      { string: 3, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 2, fret: 2, finger: 3 },
    ],
    tip: 'Similar to G major but add your index finger to the E string at fret 1. G7 creates a bluesy tension that resolves perfectly to C — a cornerstone of the I–V7 progression.',
    strumPattern: 'D D U D U',
  },
  {
    id: 'C7',
    name: 'C7',
    fullName: 'C Dominant 7',
    difficulty: 'intermediate',
    fingering: [0, 0, 0, 1],
    fingers: [{ string: 4, fret: 1, finger: 1 }],
    tip: 'Almost identical to C major — just add your index finger to the A string at fret 1. That one extra note gives a warm, soulful seventh quality used in jazz and blues.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'D7',
    name: 'D7',
    fullName: 'D Dominant 7',
    difficulty: 'intermediate',
    fingering: [2, 2, 2, 3],
    fingers: [
      { string: 3, fret: 2, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 1, fret: 2, finger: 3 },
      { string: 4, fret: 3, finger: 4 },
    ],
    tip: 'Build your D major shape first, then stretch your pinky to fret 3 of the A string. Keep your fingers arched to avoid muting adjacent strings.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'E7',
    name: 'E7',
    fullName: 'E Dominant 7',
    difficulty: 'intermediate',
    fingering: [1, 2, 0, 2],
    fingers: [
      { string: 1, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 2, fret: 2, finger: 3 },
    ],
    tip: 'Index on G string fret 1, middle on A string fret 2, ring on C string fret 2 — the E string rings open. This open voicing gives E7 a shimmering, folk-blues character.',
    strumPattern: 'D U D U D U',
  },
  {
    id: 'A7',
    name: 'A7',
    fullName: 'A Dominant 7',
    difficulty: 'intermediate',
    fingering: [0, 1, 0, 0],
    fingers: [{ string: 2, fret: 1, finger: 1 }],
    tip: 'Just your index finger on the C string at fret 1 — three strings ring completely open. A7 has a lazy, country twang and is one of the easiest seventh chords you\'ll learn.',
    strumPattern: 'D D U D U',
  },
  {
    id: 'Dm',
    name: 'Dm',
    fullName: 'D Minor',
    difficulty: 'intermediate',
    fingering: [2, 2, 1, 0],
    fingers: [
      { string: 3, fret: 1, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 1, fret: 2, finger: 3 },
    ],
    tip: 'Index on E string fret 1, middle on C string fret 2, ring on G string fret 2 — A string rings open. Dm has a melancholy, introspective quality perfect for emotional songs.',
    strumPattern: 'D D D U',
  },

  // ─── ADVANCED ──────────────────────────────────────────────────────────────────
  {
    id: 'Bb',
    name: 'Bb',
    fullName: 'Bb Major',
    difficulty: 'advanced',
    fingering: [3, 2, 1, 1],
    fingers: [
      { string: 3, fret: 1, finger: 1 },
      { string: 4, fret: 1, finger: 1 },
      { string: 2, fret: 2, finger: 2 },
      { string: 1, fret: 3, finger: 3 },
    ],
    tip: 'Index finger barres E and A strings at fret 1, middle on C at fret 2, ring on G at fret 3. Bb is your first real barre chord — firm, even pressure across both strings is the key.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'Bm',
    name: 'Bm',
    fullName: 'B Minor',
    difficulty: 'advanced',
    fingering: [4, 2, 2, 2],
    fingers: [
      { string: 2, fret: 2, finger: 1 },
      { string: 3, fret: 2, finger: 1 },
      { string: 4, fret: 2, finger: 1 },
      { string: 1, fret: 4, finger: 4 },
    ],
    tip: 'Barre your index finger across C, E, and A strings at fret 2, then stretch your pinky to G string fret 4. This is a significant reach — build up strength with daily chord-hold exercises.',
    strumPattern: 'D D D U',
  },
  {
    id: 'Fsm',
    name: 'F#m',
    fullName: 'F# Minor',
    difficulty: 'advanced',
    fingering: [2, 1, 2, 2],
    fingers: [
      { string: 2, fret: 1, finger: 1 },
      { string: 3, fret: 2, finger: 2 },
      { string: 1, fret: 2, finger: 3 },
      { string: 4, fret: 2, finger: 4 },
    ],
    tip: 'Index on C string fret 1, then three fingers fanned across G, E, and A at fret 2. F#m has a dark, rich tone and appears frequently in songs in A major and D major keys.',
    strumPattern: 'D U D U',
  },
  {
    id: 'Cm',
    name: 'Cm',
    fullName: 'C Minor',
    difficulty: 'advanced',
    fingering: [0, 3, 3, 3],
    fingers: [
      { string: 4, fret: 3, finger: 1 },
      { string: 3, fret: 3, finger: 2 },
      { string: 2, fret: 3, finger: 3 },
    ],
    tip: 'Press index, middle, and ring fingers across A, E, and C strings at fret 3 while the G string rings open. Apply firm, even pressure across all three strings to avoid buzzing.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'Eb',
    name: 'Eb',
    fullName: 'Eb Major',
    difficulty: 'advanced',
    fingering: [0, 3, 3, 1],
    fingers: [
      { string: 4, fret: 1, finger: 1 },
      { string: 3, fret: 3, finger: 2 },
      { string: 2, fret: 3, finger: 3 },
    ],
    tip: 'Index finger on A string fret 1, then stretch your middle and ring fingers up to E and C strings at fret 3 — G string rings open. The wide reach makes Eb one of ukulele\'s most challenging major chords.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'B',
    name: 'B',
    fullName: 'B Major',
    difficulty: 'advanced',
    fingering: [4, 3, 2, 2],
    fingers: [
      { string: 3, fret: 2, finger: 1 },
      { string: 4, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 3 },
      { string: 1, fret: 4, finger: 4 },
    ],
    tip: 'Barre index across E and A at fret 2, ring on C at fret 3, pinky on G at fret 4. B major is a true test of left-hand strength and finger independence — warm up with Bb first.',
    strumPattern: 'D D U D U',
  },
]

export const songs: Song[] = [
  {
    id: 'somewhere-over-the-rainbow',
    title: 'Somewhere Over the Rainbow',
    artist: "Israel Kamakawiwo'ole",
    difficulty: 'easy',
    chords: ['C', 'Am', 'F', 'G'],
    description: 'A timeless classic that feels right at home on the ukulele. Gentle, lilting, and deeply rewarding.',
    strumPattern: 'D D U D U',
  },
  {
    id: 'riptide',
    title: 'Riptide',
    artist: 'Vance Joy',
    difficulty: 'easy',
    chords: ['Am', 'G', 'C'],
    description: 'Just three chords and you\'ll sound incredible from day one. A modern anthem made for the ukulele.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    difficulty: 'easy',
    chords: ['C', 'Am', 'F', 'G'],
    description: 'One of the most beloved songs ever written, and it sits perfectly on four beginner chords.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'im-yours',
    title: "I'm Yours",
    artist: 'Jason Mraz',
    difficulty: 'easy',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'Breezy, feel-good, and basically written for the ukulele. A crowd-pleaser every time.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'cant-help-falling-in-love',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    difficulty: 'easy',
    chords: ['C', 'Em', 'Am', 'F', 'G'],
    description: 'Tender and romantic — one of the most requested ukulele songs of all time.',
    strumPattern: 'D U D U',
  },
  {
    id: 'hey-soul-sister',
    title: 'Hey Soul Sister',
    artist: 'Train',
    difficulty: 'easy',
    chords: ['C', 'G', 'Am', 'F'],
    description: 'Written on a ukulele — it shows. Upbeat, catchy, and great for building chord-switch speed.',
    strumPattern: 'D D U U D U',
  },
  {
    id: 'count-on-me',
    title: 'Count On Me',
    artist: 'Bruno Mars',
    difficulty: 'easy',
    chords: ['C', 'Em', 'F', 'G'],
    description: 'Simple, sweet, and full of warmth. The strumming pattern is forgiving for beginners.',
    strumPattern: 'D U D U',
  },
  {
    id: 'knockin-on-heavens-door',
    title: "Knockin' on Heaven's Door",
    artist: 'Bob Dylan',
    difficulty: 'easy',
    chords: ['G', 'D', 'Am'],
    description: "Three chords, iconic melody. One of the most satisfying songs to strum on any string instrument.",
    strumPattern: 'D D U D',
  },
  {
    id: 'house-of-the-rising-sun',
    title: 'House of the Rising Sun',
    artist: 'The Animals',
    difficulty: 'medium',
    chords: ['Am', 'C', 'D', 'F', 'Em'],
    description: 'A powerful minor-key classic that puts all your chords to work. Deeply expressive once it flows.',
    strumPattern: 'D U D U D U',
  },
]
