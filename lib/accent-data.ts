import type { Accent, AccentComparison } from './accent-types'

// ─── Helper: build 5 modules for any accent ────────────────────────────────

function buildModules(accentId: string, variants: Record<string, Record<string, string>>) {
    const v = variants[accentId] ?? {}

    return [
        // ── Module 1 – Sound System Foundation ──
        {
            id: '1',
            number: 1,
            title: 'Sound System Foundation',
            description: 'Master the core vowel and consonant sounds that define this accent.',
            icon: '🔊',
            totalItems: 12,
            lessons: [
                {
                    id: '1-1',
                    title: 'Vowel Shifts',
                    description: 'Learn the key vowel sounds that distinguish this accent from others.',
                    items: [
                        {
                            id: '1-1-1',
                            title: 'The /æ/ Sound (TRAP vowel)',
                            phonetic: '/æ/',
                            description: v['trap'] || 'The short "a" as in "cat", "bat", "man".',
                            examples: ['cat /kæt/', 'bat /bæt/', 'man /mæn/', 'hand /hænd/'],
                            tip: 'Open your mouth wide and push the tongue forward.',
                        },
                        {
                            id: '1-1-2',
                            title: 'The /ɑː/ Sound (PALM vowel)',
                            phonetic: '/ɑː/',
                            description: v['palm'] || 'A long open "ah" sound as in "father", "car".',
                            examples: ['father /ˈfɑːðər/', 'car /kɑːr/', 'palm /pɑːm/', 'start /stɑːrt/'],
                        },
                        {
                            id: '1-1-3',
                            title: 'The /ʌ/ Sound (STRUT vowel)',
                            phonetic: '/ʌ/',
                            description: v['strut'] || 'A short, stressed "uh" sound as in "cup", "bus".',
                            examples: ['cup /kʌp/', 'bus /bʌs/', 'love /lʌv/', 'money /ˈmʌni/'],
                        },
                    ],
                },
                {
                    id: '1-2',
                    title: 'R Pronunciation',
                    description: 'Understand how R is treated before and after vowels.',
                    items: [
                        {
                            id: '1-2-1',
                            title: 'Post-vocalic R',
                            phonetic: '/ɹ/',
                            description: v['r_post'] || 'R after a vowel — rhotic accents pronounce it, non-rhotic drop it.',
                            examples: ['car /kɑːɹ/', 'water /ˈwɔːtəɹ/', 'park /pɑːɹk/', 'heart /hɑːɹt/'],
                            tip: v['r_tip'] || 'Curl the tip of your tongue back slightly without touching the roof.',
                        },
                        {
                            id: '1-2-2',
                            title: 'Linking & Intrusive R',
                            phonetic: '/ɹ/',
                            description: v['r_link'] || 'When a word ending in a vowel is followed by another vowel, an R sound may appear.',
                            examples: ['idea of → idea-r-of', 'law and order → law-r-and order'],
                        },
                    ],
                },
                {
                    id: '1-3',
                    title: 'T-Flap Sound',
                    description: 'Learn when T becomes a quick D-like flap between vowels.',
                    items: [
                        {
                            id: '1-3-1',
                            title: 'Intervocalic T Flap',
                            phonetic: '/ɾ/',
                            description: v['t_flap'] || 'Between vowels, T sounds like a quick D: "water" → "wa-der".',
                            examples: ['water → wa-der', 'butter → buh-der', 'better → beh-der', 'city → si-dy'],
                            tip: 'Quickly tap the tongue behind your top teeth — don\'t hold the T.',
                        },
                    ],
                },
                {
                    id: '1-4',
                    title: 'Dark L',
                    description: 'Understand the "dark" L sound at the end of syllables.',
                    items: [
                        {
                            id: '1-4-1',
                            title: 'Dark L (Velarized L)',
                            phonetic: '/ɫ/',
                            description: v['dark_l'] || 'At the end of a word or before a consonant, L becomes "dark" — the back of the tongue rises.',
                            examples: ['feel /fiːɫ/', 'milk /mɪɫk/', 'tall /tɔːɫ/', 'cold /koʊɫd/'],
                            tip: 'Raise the back of your tongue toward the soft palate while the tip touches behind the teeth.',
                        },
                    ],
                },
            ],
        },

        // ── Module 2 – Word-Level Drills ──
        {
            id: '2',
            number: 2,
            title: 'Word-Level Drills',
            description: 'Practice pronunciation at the word level with minimal pairs and high-frequency words.',
            icon: '🎯',
            totalItems: 10,
            lessons: [
                {
                    id: '2-1',
                    title: 'Minimal Pairs',
                    description: 'Pairs of words that differ by only one sound — train your ear.',
                    items: [
                        { id: '2-1-1', title: 'ship vs sheep', phonetic: '/ʃɪp/ vs /ʃiːp/', description: 'Short I vs long EE vowel.', examples: ['ship /ʃɪp/', 'sheep /ʃiːp/', 'bit /bɪt/', 'beat /biːt/'] },
                        { id: '2-1-2', title: 'bat vs bet', phonetic: '/bæt/ vs /bɛt/', description: 'TRAP vs DRESS vowel.', examples: ['bat /bæt/', 'bet /bɛt/', 'man /mæn/', 'men /mɛn/'] },
                        { id: '2-1-3', title: 'cot vs caught', phonetic: '/kɑt/ vs /kɔːt/', description: v['cot_caught'] || 'LOT vs THOUGHT — merged in some accents, distinct in others.', examples: ['cot /kɑt/', 'caught /kɔːt/', 'Don /dɑn/', 'dawn /dɔːn/'] },
                    ],
                },
                {
                    id: '2-2',
                    title: 'High-Frequency Accent Words',
                    description: 'Words that immediately reveal which accent someone speaks.',
                    items: [
                        { id: '2-2-1', title: 'schedule', phonetic: v['schedule'] || '/ˈskɛdʒuːl/', description: v['schedule_note'] || 'US: "SKED-jool" / UK: "SHED-yool"', examples: ['US: /ˈskɛdʒuːl/', 'UK: /ˈʃɛdjuːl/'] },
                        { id: '2-2-2', title: 'advertisement', phonetic: v['advert'] || '/ˌædvərˈtaɪzmənt/', description: v['advert_note'] || 'Stress patterns differ between accents.', examples: ['US: /ˌædvərˈtaɪzmənt/', 'UK: /ədˈvɜːtɪsmənt/'] },
                        { id: '2-2-3', title: 'tomato', phonetic: v['tomato'] || '/təˈmeɪtoʊ/', description: 'The classic accent marker word.', examples: ['US: /təˈmeɪtoʊ/', 'UK: /təˈmɑːtoʊ/'] },
                    ],
                },
                {
                    id: '2-3',
                    title: 'Problem Words for ESL Users',
                    description: 'Words that are commonly mispronounced by non-native speakers.',
                    items: [
                        { id: '2-3-1', title: 'comfortable', phonetic: '/ˈkʌmftərbəl/', description: 'Often mispronounced as 4 syllables; native speakers say 3.', examples: ['❌ com-for-ta-ble', '✅ CUMF-ter-bul'], tip: 'Drop the "or" — it becomes "cumf-ter-bul".' },
                        { id: '2-3-2', title: 'vegetable', phonetic: '/ˈvɛdʒtəbəl/', description: 'Typically 3 syllables, not 4.', examples: ['❌ ve-ge-ta-ble', '✅ VEJ-tuh-bul'] },
                        { id: '2-3-3', title: 'wednesday', phonetic: '/ˈwɛnzdeɪ/', description: 'Silent D — never pronounced.', examples: ['❌ wed-nes-day', '✅ WENZ-day'] },
                        { id: '2-3-4', title: 'colonel', phonetic: '/ˈkɜːrnəl/', description: 'Pronounced like "kernel" — spelling is historical.', examples: ['❌ col-o-nel', '✅ KER-nul'] },
                    ],
                },
            ],
        },

        // ── Module 3 – Sentence Rhythm ──
        {
            id: '3',
            number: 3,
            title: 'Sentence Rhythm',
            description: 'Learn stress patterns, reductions, and linking in connected speech.',
            icon: '🎶',
            totalItems: 9,
            lessons: [
                {
                    id: '3-1',
                    title: 'Stress Patterns',
                    description: 'English is stress-timed — certain syllables/words get more emphasis.',
                    items: [
                        { id: '3-1-1', title: 'Content vs Function Words', phonetic: 'stress timing', description: 'Nouns, verbs, adjectives are STRESSED. Articles, prepositions, pronouns are reduced.', examples: ['I WENT to the STORE to BUY some BREAD.', 'She\'s BEEN WORKING on the PROJECT for MONTHS.'] },
                        { id: '3-1-2', title: 'Contrastive Stress', phonetic: 'emphasis shift', description: 'Moving stress to different words changes meaning entirely.', examples: ['I didn\'t say HE stole it. (someone else)', 'I didn\'t SAY he stole it. (I implied it)', 'I didn\'t say he STOLE it. (he just took it)'] },
                    ],
                },
                {
                    id: '3-2',
                    title: 'Reduction',
                    description: 'How native speakers compress common phrases in casual speech.',
                    items: [
                        { id: '3-2-1', title: 'Going to → Gonna', phonetic: '/ˈɡʌnə/', description: '"Going to" reduces to "gonna" in casual speech.', examples: ['I\'m going to eat → I\'m gonna eat', 'What are you going to do? → Whatcha gonna do?'] },
                        { id: '3-2-2', title: 'Want to → Wanna', phonetic: '/ˈwɑnə/', description: '"Want to" becomes "wanna" in fast speech.', examples: ['I want to go → I wanna go', 'Do you want to? → D\'you wanna?'] },
                        { id: '3-2-3', title: 'Have to → Hafta', phonetic: '/ˈhæftə/', description: '"Have to" compresses to "hafta".', examples: ['I have to go → I hafta go', 'You have to see this → You hafta see this'] },
                        { id: '3-2-4', title: 'Kind of → Kinda', phonetic: '/ˈkɪndə/', description: '"Kind of" reduces to "kinda".', examples: ['It\'s kind of cold → It\'s kinda cold', 'I kind of like it → I kinda like it'] },
                    ],
                },
                {
                    id: '3-3',
                    title: 'Linking Sounds',
                    description: 'How words connect smoothly in natural speech.',
                    items: [
                        { id: '3-3-1', title: 'Consonant-to-Vowel Linking', phonetic: 'Cv linking', description: 'Final consonant links to the next word\'s vowel.', examples: ['turn_off → tur-noff', 'pick_it_up → pi-ki-tup', 'an_apple → a-napple'] },
                        { id: '3-3-2', title: 'Vowel-to-Vowel Linking', phonetic: 'Vv linking', description: 'A /w/ or /j/ glide is inserted between vowels.', examples: ['go out → go-wout', 'she asked → she-yasked', 'do it → do-wit'] },
                        { id: '3-3-3', title: 'Gemination', phonetic: 'double sounds', description: 'Same consonant at boundary — hold it once, don\'t repeat.', examples: ['bus stop → bu-stop', 'hot tea → ho-tea', 'black coat → bla-coat'] },
                    ],
                },
            ],
        },

        // ── Module 4 – Real-Life Dialogue ──
        {
            id: '4',
            number: 4,
            title: 'Real-Life Dialogue',
            description: 'Practice with realistic conversation scenarios using this accent.',
            icon: '💬',
            totalItems: 8,
            lessons: [
                {
                    id: '4-1',
                    title: 'Interview Scenario',
                    description: 'Practice professional speech patterns for job interviews.',
                    items: [
                        { id: '4-1-1', title: 'Opening & Introduction', phonetic: 'formal register', description: v['interview_open'] || '"Tell me about yourself" — clear, confident, well-paced speech.', examples: ['"Thank you for having me today."', '"I\'ve been working in software development for five years."', '"I\'m excited about this opportunity because..."'] },
                        { id: '4-1-2', title: 'Handling Tough Questions', phonetic: 'pause + hedge', description: 'How to buy time and respond thoughtfully.', examples: ['"That\'s a great question. Let me think about that..."', '"In my experience, I would approach it by..."', '"To be honest, I\'m not entirely sure, but..."'] },
                    ],
                },
                {
                    id: '4-2',
                    title: 'Casual Conversation',
                    description: 'Relaxed speech patterns used with friends and family.',
                    items: [
                        { id: '4-2-1', title: 'Greetings & Small Talk', phonetic: 'informal register', description: v['casual_greet'] || 'Casual greetings and openers used in daily life.', examples: v['casual_examples'] ? v['casual_examples'].split('|') : ['"Hey, what\'s up?"', '"Not much, just chilling."', '"Did you catch the game last night?"'] },
                        { id: '4-2-2', title: 'Expressing Opinions Casually', phonetic: 'hedging', description: 'How to share opinions without sounding too formal.', examples: ['"I mean, I guess it\'s okay..."', '"Honestly, I think that\'s kinda weird."', '"I dunno, it\'s just not my thing."'] },
                    ],
                },
                {
                    id: '4-3',
                    title: 'Phone Call',
                    description: 'Telephone etiquette and speech patterns.',
                    items: [
                        { id: '4-3-1', title: 'Answering & Identifying', phonetic: 'phone register', description: v['phone_answer'] || 'Standard phone answering conventions.', examples: ['"Hello, this is [name] speaking."', '"Hi, can I speak to [name], please?"', '"May I ask who\'s calling?"'] },
                        { id: '4-3-2', title: 'Leaving a Message', phonetic: 'clear speech', description: 'Speaking clearly when leaving voicemails.', examples: ['"Hi, this is [name]. I\'m calling about..."', '"Could you please call me back at..."', '"Thank you. I\'ll try again later."'] },
                    ],
                },
                {
                    id: '4-4',
                    title: 'Presentation',
                    description: 'Public speaking and presentation delivery patterns.',
                    items: [
                        { id: '4-4-1', title: 'Opening Strong', phonetic: 'projection', description: 'How to begin a presentation with impact.', examples: ['"Good morning, everyone. Today I\'d like to talk about..."', '"Let me start by asking you a question..."', '"Imagine a world where..."'] },
                        { id: '4-4-2', title: 'Closing & Q&A', phonetic: 'summary + invite', description: 'Wrapping up clearly and inviting discussion.', examples: ['"To summarize the key takeaways..."', '"I\'d be happy to take any questions."', '"Thank you for your time and attention."'] },
                    ],
                },
            ],
        },

        // ── Module 5 – Shadowing Practice ──
        {
            id: '5',
            number: 5,
            title: 'Shadowing Practice',
            description: 'Listen and repeat at increasing speeds to build muscle memory.',
            icon: '🎧',
            totalItems: 9,
            lessons: [
                {
                    id: '5-1',
                    title: 'Short Clips (Slow)',
                    description: 'Simple sentences at a slow pace for beginners.',
                    items: [
                        { id: '5-1-1', title: 'Basic Introductions', phonetic: '🐢 Slow', description: 'Short, clear sentences for shadowing at a relaxed pace.', examples: ['"Hello, my name is Sarah."', '"I live in downtown Chicago."', '"I work as a software engineer."'] },
                        { id: '5-1-2', title: 'Daily Routines', phonetic: '🐢 Slow', description: 'Everyday sentences to practice natural rhythm.', examples: ['"I usually wake up at seven."', '"I grab a coffee on my way to work."', '"In the evening, I like to read."'] },
                        { id: '5-1-3', title: 'Simple Opinions', phonetic: '🐢 Slow', description: 'Express simple preferences clearly.', examples: ['"I think summer is the best season."', '"I prefer tea over coffee."', '"I don\'t really like spicy food."'] },
                    ],
                },
                {
                    id: '5-2',
                    title: 'Medium Clips (Normal)',
                    description: 'Longer passages at conversational speed.',
                    items: [
                        { id: '5-2-1', title: 'News Report Style', phonetic: '🎵 Normal', description: 'Practice shadowing formal news-style speech.', examples: ['"According to recent reports, the economy has shown signs of recovery in the third quarter."', '"Experts are predicting significant changes in the technology sector over the coming months."'] },
                        { id: '5-2-2', title: 'Storytelling', phonetic: '🎵 Normal', description: 'Practice natural narrative flow and intonation.', examples: ['"So last weekend, I went to this amazing restaurant downtown, and you won\'t believe what happened."', '"The thing is, I\'d never been there before, but my friend kept telling me I had to try it."'] },
                        { id: '5-2-3', title: 'Explaining a Process', phonetic: '🎵 Normal', description: 'Clear, structured explanations at normal speed.', examples: ['"First, you need to preheat the oven to three-fifty. Then, mix the dry ingredients together."', '"The key thing to remember is that you should always let the dough rest for at least thirty minutes."'] },
                    ],
                },
                {
                    id: '5-3',
                    title: 'Fast Clips (Native Speed)',
                    description: 'Challenge yourself with rapid native speech patterns.',
                    items: [
                        { id: '5-3-1', title: 'Fast Casual Chat', phonetic: '🚀 Fast', description: 'Rapid conversational speech with full reductions and linking.', examples: ['"Yeah I dunno I was kinda thinkin\' we should just go for it y\'know?"', '"I mean it\'s not like we haven\'t done this before right?"'] },
                        { id: '5-3-2', title: 'Passionate Argument', phonetic: '🚀 Fast', description: 'Emotionally charged fast speech — harder to follow.', examples: ['"No but seriously you have to understand that this is exactly what I was talking about last time!"', '"The whole point is that we can\'t keep doing the same thing and expecting different results!"'] },
                        { id: '5-3-3', title: 'Rapid-Fire Q&A', phonetic: '🚀 Fast', description: 'Quick question-answer exchanges at native speed.', examples: ['"Where\'d you go?" "Nowhere." "Whatcha mean nowhere?" "I stayed home."', '"You coming tonight?" "Probably." "Probably yes or probably no?" "Probably yes."'] },
                    ],
                },
            ],
        },
    ]
}

// ─── Per-accent variants ────────────────────────────────────────────────────

const accentVariants: Record<string, Record<string, string>> = {
    us: {
        trap: 'The flat, nasal "a" — very prominent in General American. Think: "can", "man", "dance".',
        palm: 'Fully rhotic: "car" ends with a strong R sound → /kɑːɹ/.',
        strut: 'Central, relaxed "uh" — standard in American English.',
        r_post: 'General American is RHOTIC — R is always pronounced after vowels.',
        r_tip: 'Curl your tongue tip back (retroflex R). The tongue never touches the roof.',
        r_link: 'Linking R less common than in British — Americans use R everywhere already.',
        t_flap: 'Very common! Between vowels, T becomes a quick D-like flap: "water" → "wah-der".',
        dark_l: 'Very dark L at the end of syllables — almost sounds like "ow": "feel" → "fee-ow".',
        cot_caught: 'In most of the US, "cot" and "caught" sound the SAME (cot-caught merger).',
        schedule: '/ˈskɛdʒuːl/',
        schedule_note: 'US always uses "SKED-jool" with a hard "sk" start.',
        advert: '/ˌædvɚˈtaɪzmənt/',
        advert_note: 'Stress on the third syllable: ad-ver-TIZE-ment.',
        tomato: '/təˈmeɪtoʊ/',
        interview_open: 'Confident, direct, with rising intonation to sound warm and approachable.',
        casual_greet: 'Casual American greetings — upbeat and informal.',
        casual_examples: '"Hey, what\'s up?"|"Not much, how about you?"|"Dude, did you see the game last night?"',
        phone_answer: '"Hello?" (rising intonation) or "Hey, this is [name]."',
    },
    uk: {
        trap: 'Shorter and crisper than American — "bath" uses /ɑː/ (broad A) in RP, not /æ/.',
        palm: 'RP is NON-RHOTIC — R is dropped after vowels: "car" → /kɑː/ (no R sound).',
        strut: 'More open and rounded than American — distinct from the FOOT vowel.',
        r_post: 'British RP is NON-RHOTIC — R is dropped at the end of words: "car" → /kɑː/.',
        r_tip: 'Only pronounce R before vowels. "Car" has no R, but "car is" does.',
        r_link: 'Linking R and intrusive R are very common: "idea of" → "idea-r-of".',
        t_flap: 'Less common in RP. T is often aspirated or glottalized instead: "butter" → "buh-ʔer".',
        dark_l: 'Present but less extreme than American. Clear L before vowels, dark L after.',
        cot_caught: 'Distinct in RP: "cot" /kɒt/ vs "caught" /kɔːt/ — different vowels.',
        schedule: '/ˈʃɛdjuːl/',
        schedule_note: 'UK uses "SHED-yool" with the "sh" sound at the start.',
        advert: '/ədˈvɜːtɪsmənt/',
        advert_note: 'Stress on the second syllable: ad-VER-tis-ment.',
        tomato: '/təˈmɑːtoʊ/',
        interview_open: 'Polished, measured pace. Slightly more formal and reserved.',
        casual_greet: 'British casual greetings — understated and dry.',
        casual_examples: '"Alright?"|"Yeah, not bad, thanks."|"Fancy a cuppa?"',
        phone_answer: '"Hello?" or more formally: "Good morning, [name] speaking."',
    },
    au: {
        trap: 'The Australian TRAP vowel is raised toward /e/ — "man" sounds closer to "men".',
        palm: 'Australian English is NON-RHOTIC like British RP.',
        strut: 'More centralized — can sound like a schwa /ə/ to non-Australians.',
        r_post: 'Non-rhotic — R dropped after vowels, similar to British RP.',
        r_tip: 'Only pronounce R before vowels. Use linking R between words.',
        r_link: 'Strong linking and intrusive R, similar to British patterns.',
        t_flap: 'T-flapping occurs, similar to American, but also glottal stops are common.',
        dark_l: 'Dark L is very common, sometimes vocalized to /w/: "milk" → "miwk".',
        cot_caught: 'Distinct vowels, similar to British RP.',
        schedule: '/ˈʃɛdjuːl/',
        schedule_note: 'Follows British "SHED-yool" pronunciation.',
        advert: '/ədˈvɜːtɪsmənt/',
        advert_note: 'Follows British stress pattern.',
        tomato: '/təˈmɑːtoʊ/',
        interview_open: 'Relaxed but professional — Australians tend to be more egalitarian in tone.',
        casual_greet: 'Australian slang-heavy casual speech.',
        casual_examples: '"G\'day, how ya goin\'?"|"Yeah, nah, it\'s all good."|"Wanna grab a barbie this arvo?"',
        phone_answer: '"G\'day, [name] here." or "Hello, [name] speaking."',
    },
    ca: {
        trap: 'Similar to General American but Canadian Raising affects some diphthongs.',
        palm: 'Canadian English is fully RHOTIC like American.',
        strut: 'Very similar to American pronunciation.',
        r_post: 'Rhotic — R is always pronounced, same as American English.',
        r_tip: 'Same retroflex R as American English.',
        r_link: 'Less common — Canadians pronounce R everywhere like Americans.',
        t_flap: 'Very common between vowels, just like American English.',
        dark_l: 'Similar to American dark L.',
        cot_caught: 'MERGED — "cot" and "caught" sound identical, like most of North America.',
        schedule: '/ˈskɛdʒuːl/',
        schedule_note: 'Canadian "SKED-jool" — same as American.',
        advert: '/ˌædvɚˈtaɪzmənt/',
        advert_note: 'Follows American stress pattern.',
        tomato: '/təˈmeɪtoʊ/',
        interview_open: 'Polite and measured. Canadians often soften statements with "eh?" and qualifiers.',
        casual_greet: 'Canadian casual — polite with distinctive markers.',
        casual_examples: '"Hey, how\'s it goin\', eh?"|"Oh for sure, bud."|"Wanna grab a Timmies?"',
        phone_answer: '"Hello?" or "Hi there, [name] calling."',
    },
    ie: {
        trap: 'Irish English often uses a slightly broader /a/ for TRAP words.',
        palm: 'Irish English is generally RHOTIC — R is pronounced after vowels.',
        strut: 'Closer to /ʊ/ in some Irish accents — "bus" can sound like "buss" with a rounder vowel.',
        r_post: 'Irish English is RHOTIC — R is clearly pronounced, often with an alveolar tap.',
        r_tip: 'Irish R is often tapped /ɾ/ rather than the American retroflex.',
        r_link: 'Less common — since Irish English is rhotic, linking R isn\'t as needed.',
        t_flap: 'Less common — Irish often use a dental T /t̪/ or even a "tch" sound.',
        dark_l: 'Less dark than American — Irish L tends to stay clearer in most positions.',
        cot_caught: 'Generally DISTINCT — different vowel qualities are maintained.',
        schedule: '/ˈskɛdʒuːl/',
        schedule_note: 'Usually "SKED-jool" like American, though some say "SHED-yool".',
        advert: '/ədˈvɜːrtɪsmənt/',
        advert_note: 'Variable — influences from both British and American patterns.',
        tomato: '/təˈmeɪtoʊ/',
        interview_open: 'Warm, friendly, often with storytelling elements. Irish speakers are known for verbal charm.',
        casual_greet: 'Irish casual — warm and expressive.',
        casual_examples: '"How\'s the craic?"|"Ah sure, grand so."|"Will you come for a pint later?"',
        phone_answer: '"Hello there!" or "Howya, [name] here."',
    },
}

// ─── Accent definitions ─────────────────────────────────────────────────────

export const accents: Accent[] = [
    {
        id: 'us',
        name: 'General American',
        flag: '🇺🇸',
        region: 'United States',
        description: 'The most widely understood English accent worldwide. Clear, rhotic (R is always pronounced), with distinctive vowel reductions and T-flapping.',
        color: '#3B82F6',
        colorLight: '#DBEAFE',
        lang: 'en-US',
        modules: buildModules('us', accentVariants),
        tips: [
            { id: 'us-t1', title: 'Always pronounce your R', description: 'Unlike British, American English is rhotic — R is never silent. "Car" = /kɑːɹ/.', icon: '🔤' },
            { id: 'us-t2', title: 'Flap your T\'s', description: 'Between vowels, T sounds like D: "water" = "wah-der", "city" = "si-dy".', icon: '💧' },
            { id: 'us-t3', title: 'Use the nasal /æ/', description: 'The "a" in "cat" and "man" is flat and slightly nasal — distinctively American.', icon: '👃' },
            { id: 'us-t4', title: 'Drop the "t" in contractions', description: '"Don\'t", "can\'t" — the T at the end often becomes a glottal stop.', icon: '🔇' },
        ],
        commonMistakes: [
            { id: 'us-m1', country: 'Spanish speakers', flag: '🇪🇸', mistake: 'Adding "eh" before S-clusters', correction: '"school" not "eschool"', example: '❌ "I go to eschool" → ✅ "I go to school"' },
            { id: 'us-m2', country: 'Japanese speakers', flag: '🇯🇵', mistake: 'Confusing R and L', correction: 'Practice minimal pairs: "right" vs "light"', example: '❌ "I ate lice" → ✅ "I ate rice"' },
            { id: 'us-m3', country: 'Arabic speakers', flag: '🇸🇦', mistake: 'Pronouncing P as B', correction: '"park" not "bark" — push air out for P', example: '❌ "I went to the bark" → ✅ "I went to the park"' },
            { id: 'us-m4', country: 'Chinese speakers', flag: '🇨🇳', mistake: 'Missing final consonants', correction: 'Clearly pronounce word endings: "worked" /wɜːrkt/', example: '❌ "I wor- yesterday" → ✅ "I worked yesterday"' },
        ],
    },
    {
        id: 'uk',
        name: 'British RP',
        flag: '🇬🇧',
        region: 'United Kingdom',
        description: 'Received Pronunciation — the prestige accent of British English. Non-rhotic, with crisp consonants and distinct vowel clarity.',
        color: '#EF4444',
        colorLight: '#FEE2E2',
        lang: 'en-GB',
        modules: buildModules('uk', accentVariants),
        tips: [
            { id: 'uk-t1', title: 'Drop the R after vowels', description: 'RP is non-rhotic: "car" = /kɑː/, "water" = /ˈwɔːtə/. Only pronounce R before vowels.', icon: '🔇' },
            { id: 'uk-t2', title: 'Use the broad A', description: '"Bath", "dance", "can\'t" use /ɑː/ not /æ/: "bahth" not "bath".', icon: '🛁' },
            { id: 'uk-t3', title: 'Aspirate your T', description: 'Don\'t flap T like Americans. Pronounce it clearly: "water" = "waw-tah".', icon: '💨' },
            { id: 'uk-t4', title: 'Master the glottal stop', description: '"bottle" → "bo-ʔle" — common in modern RP and Estuary English.', icon: '🫧' },
        ],
        commonMistakes: [
            { id: 'uk-m1', country: 'American speakers', flag: '🇺🇸', mistake: 'Pronouncing R after vowels', correction: 'Drop the R: "car" = /kɑː/ not /kɑːɹ/', example: '❌ "The carr is parked" → ✅ "The cah is pahked"' },
            { id: 'uk-m2', country: 'Indian speakers', flag: '🇮🇳', mistake: 'Using retroflex consonants', correction: 'Use dental/alveolar T, D instead of retroflex', example: '❌ using T/D with tongue curled back → ✅ tongue behind teeth' },
            { id: 'uk-m3', country: 'French speakers', flag: '🇫🇷', mistake: 'Stressing syllables evenly', correction: 'English is stress-timed — reduce unstressed syllables', example: '❌ "COM-for-TA-ble" → ✅ "CUMF-ta-bul"' },
            { id: 'uk-m4', country: 'German speakers', flag: '🇩🇪', mistake: 'Pronouncing W as V', correction: '"wine" uses /w/ (round lips), not /v/', example: '❌ "I like vine" → ✅ "I like wine"' },
        ],
    },
    {
        id: 'au',
        name: 'Australian',
        flag: '🇦🇺',
        region: 'Australia',
        description: 'A distinctive non-rhotic accent with raised vowels, unique diphthongs, and rising intonation patterns.',
        color: '#F59E0B',
        colorLight: '#FEF3C7',
        lang: 'en-AU',
        modules: buildModules('au', accentVariants),
        tips: [
            { id: 'au-t1', title: 'Raise your vowels', description: 'TRAP vowel shifts up: "man" sounds more like "men". DRESS shifts toward FLEECE.', icon: '⬆️' },
            { id: 'au-t2', title: 'Use rising intonation', description: 'Australians often use uptalk (rising pitch at sentence end) even for statements.', icon: '📈' },
            { id: 'au-t3', title: 'Shorten everything', description: 'Australians abbreviate constantly: "afternoon" → "arvo", "breakfast" → "brekkie".', icon: '✂️' },
            { id: 'au-t4', title: 'Master "yeah-nah" and "nah-yeah"', description: '"Yeah-nah" means no. "Nah-yeah" means yes. Context is everything!', icon: '🤷' },
        ],
        commonMistakes: [
            { id: 'au-m1', country: 'American speakers', flag: '🇺🇸', mistake: 'Not raising vowels enough', correction: '"Day" = /dæɪ/ not /deɪ/ — the starting vowel is more open', example: '❌ American "day" → ✅ Australian "die-ee"' },
            { id: 'au-m2', country: 'British speakers', flag: '🇬🇧', mistake: 'Missing the nasal quality', correction: 'Australian vowels have slight nasalization', example: 'Add a slight nasal quality to open vowels' },
            { id: 'au-m3', country: 'Asian speakers', flag: '🌏', mistake: 'Not using abbreviations', correction: 'Use common Aussie abbreviations in casual speech', example: '❌ "This afternoon" → ✅ "This arvo"' },
        ],
    },
    {
        id: 'ca',
        name: 'Canadian',
        flag: '🇨🇦',
        region: 'Canada',
        description: 'Similar to General American but with distinctive Canadian Raising, the cot-caught merger, and characteristic politeness markers.',
        color: '#DC2626',
        colorLight: '#FECACA',
        lang: 'en-CA',
        modules: buildModules('ca', accentVariants),
        tips: [
            { id: 'ca-t1', title: 'Master Canadian Raising', description: 'The "ou" in "about" starts higher: /əˈbʌʊt/ — it\'s NOT "aboot" but the vowel IS different.', icon: '🏔️' },
            { id: 'ca-t2', title: '"Eh" is strategic', description: '"Eh?" at the end of sentences seeks confirmation: "Nice day, eh?" = "Don\'t you think so?"', icon: '🍁' },
            { id: 'ca-t3', title: 'Cot = Caught', description: 'These vowels are merged in Canadian English — both use the same sound.', icon: '🔗' },
            { id: 'ca-t4', title: '"Sorry" sounds different', description: 'Canadians say /ˈsɔːri/ (rhymes with "story"), not /ˈsɑːri/ (American).', icon: '🙏' },
        ],
        commonMistakes: [
            { id: 'ca-m1', country: 'American speakers', flag: '🇺🇸', mistake: 'Missing Canadian Raising', correction: '"Out and about" — the /aʊ/ diphthong starts higher before voiceless consonants', example: '❌ American "owt" → ✅ Canadian /ʌʊt/' },
            { id: 'ca-m2', country: 'British speakers', flag: '🇬🇧', mistake: 'Using non-rhotic R', correction: 'Canadian is rhotic — always pronounce your R', example: '❌ "Cah pahk" → ✅ "Car park" with clear R' },
            { id: 'ca-m3', country: 'French speakers', flag: '🇫🇷', mistake: 'Over-Frenchifying Quebec terms', correction: 'Anglo-Canadian pronunciation of French loanwords differs', example: '"Poutine": Canadian /puːˈtiːn/ not French /putin/' },
        ],
    },
    {
        id: 'ie',
        name: 'Irish',
        flag: '🇮🇪',
        region: 'Ireland',
        description: 'A melodic, rhotic accent influenced by Irish Gaelic. Features dental consonants, distinctive intonation, and rich vocabulary.',
        color: '#22C55E',
        colorLight: '#DCFCE7',
        lang: 'en-IE',
        modules: buildModules('ie', accentVariants),
        tips: [
            { id: 'ie-t1', title: 'Use dental consonants', description: 'T, D, N are pronounced with the tongue touching the teeth (dental), not the ridge behind them.', icon: '🦷' },
            { id: 'ie-t2', title: 'Master the Irish R', description: 'Irish R is often a tap /ɾ/ — quick flick of the tongue, not the American curl.', icon: '🔁' },
            { id: 'ie-t3', title: 'Learn the intonation', description: 'Irish English has a distinctive "sing-song" melody with more pitch variation than American.', icon: '🎵' },
            { id: 'ie-t4', title: '"TH" becomes "T" or "D"', description: '"Think" → "tink", "this" → "dis" — very common in Irish English.', icon: '💭' },
        ],
        commonMistakes: [
            { id: 'ie-m1', country: 'American speakers', flag: '🇺🇸', mistake: 'Using retroflex R', correction: 'Irish R is tapped, not curled — quick tongue flick', example: '❌ American curled R → ✅ Quick tap /ɾ/' },
            { id: 'ie-m2', country: 'British speakers', flag: '🇬🇧', mistake: 'Dropping the R', correction: 'Irish English is rhotic — always pronounce R', example: '❌ "Fah-dah" → ✅ "Far-der" with tapped R' },
            { id: 'ie-m3', country: 'European speakers', flag: '🇪🇺', mistake: 'Missing the dental consonants', correction: 'Place tongue on teeth for T/D/N, not the alveolar ridge', example: '❌ alveolar T → ✅ dental T (tongue on teeth)' },
        ],
    },
]

// ─── Accent Comparison Data ─────────────────────────────────────────────────

export const accentComparisons: AccentComparison[] = [
    // Vowels
    { word: 'bath', category: 'vowels', pronunciations: { us: '/bæθ/', uk: '/bɑːθ/', au: '/bɑːθ/', ca: '/bæθ/', ie: '/bæθ/' }, notes: 'The BATH split: US/CA/IE use short A, UK/AU use broad A.' },
    { word: 'lot', category: 'vowels', pronunciations: { us: '/lɑːt/', uk: '/lɒt/', au: '/lɒt/', ca: '/lɑːt/', ie: '/lɑt/' }, notes: 'US/CA unround the vowel; UK/AU keep it rounded.' },
    { word: 'thought', category: 'vowels', pronunciations: { us: '/θɑːt/', uk: '/θɔːt/', au: '/θoːt/', ca: '/θɑːt/', ie: '/θɔːt/' }, notes: 'US/CA merge with LOT (cot-caught merger); others keep it distinct.' },
    { word: 'nurse', category: 'vowels', pronunciations: { us: '/nɜːɹs/', uk: '/nɜːs/', au: '/nɜːs/', ca: '/nɜːɹs/', ie: '/nɜːɹs/' }, notes: 'Rhotic accents (US/CA/IE) add R coloring to the vowel.' },
    { word: 'face', category: 'vowels', pronunciations: { us: '/feɪs/', uk: '/feɪs/', au: '/fæɪs/', ca: '/feɪs/', ie: '/feːs/' }, notes: 'Australian starts more open; Irish may use a monophthong.' },

    // Consonants
    { word: 'car', category: 'consonants', pronunciations: { us: '/kɑːɹ/', uk: '/kɑː/', au: '/kɑː/', ca: '/kɑːɹ/', ie: '/kɑːɾ/' }, notes: 'R treatment: US/CA retroflex, IE tapped, UK/AU dropped.' },
    { word: 'water', category: 'consonants', pronunciations: { us: '/ˈwɑːɾɚ/', uk: '/ˈwɔːtə/', au: '/ˈwoːɾə/', ca: '/ˈwɑːɾɚ/', ie: '/ˈwɑːt̪əɾ/' }, notes: 'T-flapping in US/CA/AU; aspirated T in UK; dental T in IE.' },
    { word: 'bottle', category: 'consonants', pronunciations: { us: '/ˈbɑːɾl̩/', uk: '/ˈbɒʔl̩/', au: '/ˈbɒʔl̩/', ca: '/ˈbɑːɾl̩/', ie: '/ˈbɑt̪l̩/' }, notes: 'Glottal stop in UK/AU; flapped T in US/CA; dental T in IE.' },
    { word: 'think', category: 'consonants', pronunciations: { us: '/θɪŋk/', uk: '/θɪŋk/', au: '/θɪŋk/', ca: '/θɪŋk/', ie: '/t̪ɪŋk/' }, notes: 'TH → dental T is characteristic of Irish English.' },
    { word: 'three', category: 'consonants', pronunciations: { us: '/θɹiː/', uk: '/θɹiː/', au: '/θɹiː/', ca: '/θɹiː/', ie: '/t̪ɾiː/' }, notes: 'Irish replaces TH with dental T and uses tapped R.' },

    // Common words
    { word: 'schedule', category: 'common-words', pronunciations: { us: '/ˈskɛdʒuːl/', uk: '/ˈʃɛdjuːl/', au: '/ˈʃɛdjuːl/', ca: '/ˈskɛdʒuːl/', ie: '/ˈskɛdʒuːl/' }, notes: 'US/CA/IE: "SKED-jool" · UK/AU: "SHED-yool"' },
    { word: 'advertisement', category: 'common-words', pronunciations: { us: '/ˌædvɚˈtaɪzmənt/', uk: '/ədˈvɜːtɪsmənt/', au: '/ədˈvɜːtɪsmənt/', ca: '/ˌædvɚˈtaɪzmənt/', ie: '/ˌædvəɹˈtaɪzmənt/' }, notes: 'Different stress: US/CA on 3rd syllable, UK/AU on 2nd.' },
    { word: 'tomato', category: 'common-words', pronunciations: { us: '/təˈmeɪtoʊ/', uk: '/təˈmɑːtəʊ/', au: '/təˈmɑːtoʊ/', ca: '/təˈmeɪtoʊ/', ie: '/təˈmeɪtoʊ/' }, notes: 'The classic: US has /eɪ/ (may), UK has /ɑː/ (mah).' },
    { word: 'garage', category: 'common-words', pronunciations: { us: '/ɡəˈɹɑːʒ/', uk: '/ˈɡæɹɑːʒ/', au: '/ˈɡæɹɑːʒ/', ca: '/ɡəˈɹɑːʒ/', ie: '/ˈɡæɹɑːʒ/' }, notes: 'US stresses 2nd syllable; UK stresses 1st.' },
    { word: 'herb', category: 'common-words', pronunciations: { us: '/ɜːɹb/', uk: '/hɜːb/', au: '/hɜːb/', ca: '/ɜːɹb/', ie: '/hɜːɹb/' }, notes: 'US/CA drop the H; UK/AU/IE pronounce it.' },
    { word: 'aluminium', category: 'common-words', pronunciations: { us: '/əˈluːmɪnəm/', uk: '/ˌæljʊˈmɪniəm/', au: '/ˌæljʊˈmɪniəm/', ca: '/əˈluːmɪnəm/', ie: '/ˌæljʊˈmɪniəm/' }, notes: 'US/CA: 4 syllables (aluminum). UK/AU/IE: 5 syllables (aluminium).' },

    // Phrases
    { word: 'How are you?', category: 'phrases', pronunciations: { us: 'How are ya?', uk: 'How do you do?', au: 'How ya goin\'?', ca: 'How\'s it goin\', eh?', ie: 'How\'s the craic?' }, notes: 'Each accent has its own casual greeting style.' },
    { word: 'Goodbye', category: 'phrases', pronunciations: { us: 'See ya later!', uk: 'Cheerio! / Cheers!', au: 'See ya, mate!', ca: 'Take care, eh!', ie: 'Slan! / Mind yourself!' }, notes: 'Casual farewell expressions vary significantly.' },
    { word: 'That\'s great!', category: 'phrases', pronunciations: { us: 'Awesome! / Cool!', uk: 'Brilliant! / Lovely!', au: 'Bonzer! / Ripper!', ca: 'Beauty! / Sweet!', ie: 'Deadly! / Grand!' }, notes: 'Enthusiastic approval varies by region.' },
    { word: 'I don\'t know', category: 'phrases', pronunciations: { us: 'I dunno / Beats me', uk: 'I haven\'t a clue', au: 'Dunno, mate', ca: 'I\'m not sure, eh', ie: 'Haven\'t a notion' }, notes: 'Casual ways to express uncertainty.' },
]

// ─── Helper functions ───────────────────────────────────────────────────────

export function getAccent(id: string): Accent | undefined {
    return accents.find((a) => a.id === id)
}

export function getAccentModule(accentId: string, moduleId: string): { accent: Accent; module: typeof accents[0]['modules'][0] } | undefined {
    const accent = getAccent(accentId)
    if (!accent) return undefined
    const mod = accent.modules.find((m) => m.id === moduleId)
    if (!mod) return undefined
    return { accent, module: mod }
}

export function getComparisons(category?: AccentComparison['category']): AccentComparison[] {
    if (!category) return accentComparisons
    return accentComparisons.filter((c) => c.category === category)
}
