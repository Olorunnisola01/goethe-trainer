'use client';

import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';

/* ──────────────────────────────────────────────────────
   Official Goethe-Zertifikat exam structure.
   Interface text is English for learners; the German skill
   names (Lesen / Hören / Schreiben / Sprechen) and "Teil"
   are kept on purpose.
────────────────────────────────────────────────────── */
const EXAMS = [
  /* ═══════════════════════ A1 ═══════════════════════ */
  {
    level: 'A1',
    fullName: 'Start Deutsch 1',
    color: '#15803d',
    bg: '#f0fdf4',
    bd: '#bbf7d0',
    badge: { bg: '#dcfce7', color: '#15803d' },
    totalTime: '80 Min',
    setup: 'Groups (3–4 people)',
    totalPts: '60 points',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '25 Min',
        pts: '15 points',
        questions: '15 tasks',
        desc: '3 Teile — read and understand short everyday texts, ads and public signs.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Short messages & letters',
            type: 'True / False',
            count: '5 tasks',
            playback: null,
            themes: ['Short emails', 'Postcards', 'Notes between friends'],
            tip: 'You read two short everyday texts. Read the statements first, then find the answer in the text.',
          },
          {
            num: 'Teil 2',
            title: 'Ads & information',
            type: 'Multiple choice (a / b)',
            count: '5 tasks',
            playback: null,
            themes: ['Classified ads', 'Online shops', 'Event posters', 'Info pages'],
            tip: 'Only two answer options — check whether the information matches exactly.',
          },
          {
            num: 'Teil 3',
            title: 'Public notices & signs',
            type: 'True / False',
            count: '5 tasks',
            playback: null,
            themes: ['Shop opening hours', 'Station notices', 'Prohibition signs', 'Short instructions'],
            tip: 'Short texts — watch for exact wording and negations.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '20 Min',
        pts: '15 points',
        questions: '15 tasks',
        desc: '3 Teile — short everyday conversations, public announcements and phone messages.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Short everyday conversations',
            type: 'Multiple choice — pick a picture (a / b / c)',
            count: '6 tasks · play 2×',
            playback: 'play 2×',
            themes: ['Shopping', 'Asking for directions', 'Making plans', 'Prices & times', 'Personal information'],
            tip: 'First listen: grasp the topic. Second listen: confirm the answer. The correct answer is a picture (a, b or c).',
          },
          {
            num: 'Teil 2',
            title: 'Public announcements',
            type: 'True / False',
            count: '4 tasks · play 1× only',
            playback: 'play 1× only!',
            themes: ['Station announcements', 'Airport', 'Supermarket speakers', 'School announcements'],
            tip: 'Heard only once! Note numbers, platforms and times immediately.',
          },
          {
            num: 'Teil 3',
            title: 'Answering machines & phone messages',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks · play 2×',
            playback: 'play 2×',
            themes: ['Appointment cancellations', 'Invitations', 'Information requests', 'Delivery notifications'],
            tip: 'Who is calling? Why? What should you do? Keep these three questions in mind while listening.',
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '20 Min',
        pts: '15 points',
        questions: '2 Teile',
        desc: '2 Teile — fill in a form and write a short message.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Fill in a form',
            type: 'Short answers (5 fields)',
            count: '5 fields',
            playback: null,
            themes: ['Hotel reservation', 'Course registration', 'Library card', 'Name, address, job, date, email'],
            tip: 'You read a short text about a person and enter 5 pieces of information into a form. Only what is asked — no full sentences needed.',
          },
          {
            num: 'Teil 2',
            title: 'Write a short message',
            type: 'Free text · 3 content points',
            count: '≈ 30 words',
            playback: null,
            themes: ['Email to a friend', 'Postcard', 'Note', 'Why are you writing? Details? Meeting point?'],
            tip: 'The task gives 3 content points — all three must be addressed, otherwise points are deducted.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min',
        pts: '15 points',
        questions: '3 Teile',
        desc: '3 Teile — introduce yourself, ask for information and make requests. Exam in groups (3–4 people).',
        teile: [
          {
            num: 'Teil 1',
            title: 'Introduce yourself',
            type: 'Monologue with a keyword list',
            count: 'Keywords: name, age, country, residence, languages, job, hobby',
            playback: null,
            themes: ['Name, age, origin', 'Residence, job', 'Languages, hobbies', 'Spelling & saying numbers'],
            tip: 'After the introduction the examiner asks you to spell a name or city and to say a number (e.g. a phone number) in German.',
          },
          {
            num: 'Teil 2',
            title: 'Ask and answer questions',
            type: 'Card game: keyword + topic → question',
            count: '1 card per candidate',
            playback: null,
            themes: [`"Food & drink" + "Sunday" → What do you eat on Sundays?`, `"Sport" + "evening" → Do you do sport in the evening?`],
            tip: 'You draw a card, form a question and ask your neighbour. They answer — then it is their turn.',
          },
          {
            num: 'Teil 3',
            title: 'Make requests',
            type: 'Picture card → polite request',
            count: '1 picture card per candidate',
            playback: null,
            themes: [`Apple → "Please give me the apple."`, `Water → "Could you give me some water?"`, 'Jacket, pen, door'],
            tip: `The card shows a picture without a word — form a polite request. Your partner reacts appropriately ("Here you go." / "Sorry...").`,
          },
        ],
      },
    ],
  },

  /* ═══════════════════════ A2 ═══════════════════════ */
  {
    level: 'A2',
    fullName: 'Goethe-Zertifikat A2',
    color: '#1d4ed8',
    bg: '#eff6ff',
    bd: '#bfdbfe',
    badge: { bg: '#dbeafe', color: '#1d4ed8' },
    totalTime: '105 Min',
    setup: 'Pairs (2 people)',
    totalPts: '85 points',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '30 Min',
        pts: '20 points',
        questions: '20 tasks',
        desc: '4 Teile — information texts, directories, emails/letters and classified ads.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Information texts',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks',
            playback: null,
            themes: ['Newspaper articles', 'Information brochures', 'Notice board'],
            tip: 'Longer text — mark keywords in the questions, then search the text specifically.',
          },
          {
            num: 'Teil 2',
            title: 'Notice board / directory',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks',
            playback: null,
            themes: ['Department store map', 'TV guide', 'Course catalogue', 'Timetable'],
            tip: 'You must locate specific information — scan the text, do not read everything.',
          },
          {
            num: 'Teil 3',
            title: 'Emails and letters',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks',
            playback: null,
            themes: ['Friendly emails', 'Formal letters', 'Business correspondence'],
            tip: 'Watch the tone — formal vs. informal changes the meaning of individual statements.',
          },
          {
            num: 'Teil 4',
            title: 'Match classified ads',
            type: 'Matching (situation → ad)',
            count: '5 tasks',
            playback: null,
            themes: ['Looking for a used bike', 'Apartment offers', 'Courses & services'],
            tip: '5 situations (people) and several ads — read the situation descriptions first, then find the matching ad.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '30 Min',
        pts: '20 points',
        questions: '20 tasks',
        desc: '4 Teile — radio/voicemail, information monologue (matching), conversations and a radio interview.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Radio & phone messages',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks · play 2×',
            playback: 'play 2×',
            themes: ['Weather report', 'Traffic news', 'Voicemail messages', 'Radio news'],
            tip: 'First listen: main message. Second listen: confirm the details and the right option.',
          },
          {
            num: 'Teil 2',
            title: 'Information monologue (matching)',
            type: 'Matching — pictures / days / names',
            count: '5 tasks · play 1× only',
            playback: 'play 1× only!',
            themes: ['Event calendar', 'Travel guide', 'Programme overview'],
            tip: 'Heard only once! Glance at the table/pictures beforehand to be prepared.',
          },
          {
            num: 'Teil 3',
            title: 'Short talks between acquaintances',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks · play 1× only',
            playback: 'play 1× only!',
            themes: ['Conversations among friends', 'Colleague talks', 'Everyday situations'],
            tip: 'Heard only once — focus on the core message, ignore distracting details.',
          },
          {
            num: 'Teil 4',
            title: 'Radio interview',
            type: 'Yes / No (True / False)',
            count: '5 tasks · play 2×',
            playback: 'play 2×',
            themes: ['Interview with a guest', 'Podcast conversation', 'Personal accounts'],
            tip: "You judge the guest's statements — did they really say it that way? Check paraphrases carefully.",
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '30 Min',
        pts: '20 points',
        questions: '2 Teile',
        desc: '2 Teile — informal short message and a formal email/letter. 3 content points each.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Informal message (SMS / short email)',
            type: 'Free text · 3 content points',
            count: '≈ 20–30 words',
            playback: null,
            themes: ['Running late', 'Cancel an appointment and suggest a new one', 'Short info to a friend/colleague'],
            tip: 'Address all 3 content points. Short and direct — an informal tone is expected.',
          },
          {
            num: 'Teil 2',
            title: 'Formal email / letter',
            type: 'Free text · 3 content points · formal',
            count: '≈ 30–40 words',
            playback: null,
            themes: ['Sick note to your boss', 'Information request to a tourist office', 'Request to a landlord or course leader'],
            tip: 'Do not forget the formal greeting "Sehr geehrte/r..." and closing "Mit freundlichen Grüßen". Address all 3 points.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min',
        pts: '25 points',
        questions: '3 Teile',
        desc: '3 Teile — ask questions, talk about yourself and plan together. Exam in pairs.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Ask and answer questions',
            type: 'Card game: 4 keywords on a topic',
            count: '4 cards per candidate',
            playback: null,
            themes: [`Topic "language school": teacher, homework, break, course`, `Topic "free time": sport, music, cinema, weekend`],
            tip: 'You and your partner take turns drawing cards and asking questions. It is a simple conversation — no monologues.',
          },
          {
            num: 'Teil 2',
            title: 'Talk about yourself (short monologue)',
            type: 'Monologue with 4 bullet points',
            count: '≈ 1–2 Min per candidate',
            playback: null,
            themes: [`"What do you do with your money?" → clothes / travel / food / saving`, 'Similar questions with 4 aspects'],
            tip: 'Speak freely about yourself — use the 4 points as a guide, not a checklist.',
          },
          {
            num: 'Teil 3',
            title: 'Plan something together',
            type: 'Dialogue — reach agreement',
            count: '≈ 2–3 Min in pairs',
            playback: null,
            themes: ['Buy a birthday gift for a friend', 'Find a time for coffee', 'Plan a trip together'],
            tip: `Make suggestions ("How about...?"), respond to your partner ("That's a good idea, but..."), and reach a result together.`,
          },
        ],
      },
    ],
  },

  /* ═══════════════════════ B1 ═══════════════════════ */
  {
    level: 'B1',
    fullName: 'Goethe-Zertifikat B1',
    color: '#7c3aed',
    bg: '#f5f3ff',
    bd: '#ddd6fe',
    badge: { bg: '#ede9fe', color: '#7c3aed' },
    totalTime: '3 hrs',
    setup: 'Pairs · 15 Min prep time (Sprechen)',
    totalPts: '100 points (scaled)',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '65 Min',
        pts: '30 points',
        questions: '30 tasks',
        desc: '5 Teile — blog/email, newspaper article, ad matching, forum posts and formal rules.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Blog post or personal email',
            type: 'True / False',
            count: '6 tasks',
            playback: null,
            themes: ['Diary entry', 'Personal account', 'Detailed email'],
            tip: 'Longer personal text — check each statement carefully and watch the details.',
          },
          {
            num: 'Teil 2',
            title: 'Newspaper / magazine article',
            type: 'Multiple choice (a / b / c)',
            count: '6 tasks (2 texts · 3 questions each)',
            playback: null,
            themes: ['Society & culture', 'Environment', 'Work & career', 'Tech & media'],
            tip: 'Read the questions first, then search the text specifically for the answer.',
          },
          {
            num: 'Teil 3',
            title: 'Match the ads',
            type: 'Matching · "0" = no matching ad',
            count: '7 tasks (10 situations · 7 ads)',
            playback: null,
            themes: ['Course and holiday offers', 'Job offers', 'Services'],
            tip: '⚠️ Important: there are more situations (10) than ads (7). For at least one situation there is no matching ad → enter "0" on the answer sheet.',
          },
          {
            num: 'Teil 4',
            title: 'Forum opinions / reader letters',
            type: 'Yes / No (for / against)',
            count: '7 tasks (7 short texts)',
            playback: null,
            themes: ['Should shops open on Sundays?', 'Are computer games harmful?', 'Online discussions on everyday topics'],
            tip: 'Each text is a short opinion from one person — decide: are they for it (Yes) or against it (No)?',
          },
          {
            num: 'Teil 5',
            title: 'Rules and regulations',
            type: 'Multiple choice (a / b / c)',
            count: '4 tasks',
            playback: null,
            themes: ['House rules', 'Terms & conditions', 'Instruction manuals', 'Official regulations'],
            tip: 'Formal, bureaucratic German — focus on exact meaning, no interpretation.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '40 Min',
        pts: '30 points',
        questions: '30 tasks',
        desc: '4 Teile — short announcements, information monologue, long dialogue and radio discussion.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Short announcements & messages',
            type: 'True/False + Multiple choice (per recording)',
            count: '10 tasks (5 recordings · 1× T/F + 1× MC each) · play 2×',
            playback: 'play 2×',
            themes: ['Public announcements', 'Voicemail messages', 'Automated phone messages'],
            tip: 'For each of the 5 recordings there are 2 questions: first True/False, then multiple choice. First listen: overview. Second listen: details.',
          },
          {
            num: 'Teil 2',
            title: 'Informative monologue / talk',
            type: 'Multiple choice (a / b / c)',
            count: '5 tasks · play 1× only',
            playback: 'play 1× only!',
            themes: ['Museum tour', 'Welcome speech', 'Information talk'],
            tip: 'Heard only once — read the questions beforehand and prepare for key terms.',
          },
          {
            num: 'Teil 3',
            title: 'Longer conversation (2 people)',
            type: 'True / False',
            count: '7 tasks · play 1× only',
            playback: 'play 1× only!',
            themes: ['Personal accounts', 'Joint planning', 'Discussion about experiences'],
            tip: 'Heard only once — who says what? Watch for speaker changes.',
          },
          {
            num: 'Teil 4',
            title: 'Radio discussion (3 speakers)',
            type: 'Matching — who says this?',
            count: '8 tasks · play 2×',
            playback: 'play 2×',
            themes: ['Moderated debate (host + 2 guests)', 'Controversial everyday topics', 'Different points of view'],
            tip: '3 speakers: host + 2 guests with different opinions. Match each statement to the right person. Watch for signal words.',
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '60 Min',
        pts: '100 points (scaled)',
        questions: '3 Teile',
        desc: '3 Teile — informal email (~80 words), forum post (~80 words) and formal email (~40 words).',
        teile: [
          {
            num: 'Teil 1',
            title: 'Informal email to a friend',
            type: 'Free text · 3 content points',
            count: '≈ 80 words',
            playback: null,
            themes: ['Report on something you did or bought', 'Express feelings and opinion', 'Make a suggestion or plan a meeting'],
            tip: 'Address all 3 content points. A structured text with an opening and closing. Informal tone.',
          },
          {
            num: 'Teil 2',
            title: 'Express an opinion (forum post)',
            type: 'Free text · your opinion with reasons',
            count: '≈ 80 words',
            playback: null,
            themes: ['Should public transport be free?', 'Are computer games good or bad for kids?', 'Current everyday social topics'],
            tip: 'State a clear opinion + give reasons. Write coherently. Not essay style — a natural forum comment.',
          },
          {
            num: 'Teil 3',
            title: 'Formal email (apology / cancellation)',
            type: 'Free text · formal register',
            count: '≈ 40 words',
            playback: null,
            themes: ['Cancel an appointment and give a reason', 'Apology to a course leader or boss', 'Suggest an alternative'],
            tip: '⚠️ Careful: a formal register is required — "Sehr geehrte/r..." / "Mit freundlichen Grüßen". Points are deducted for the wrong tone.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min + 15 Min prep',
        pts: '100 points (scaled)',
        questions: '3 Teile',
        desc: '3 Teile — plan together, present a topic (5 sections) and answer follow-up questions. Exam in pairs.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Plan something together',
            type: 'Dialogue · reach agreement',
            count: '≈ 3 minutes',
            playback: null,
            themes: [
              'Scenario: a colleague is in hospital — you want to visit them',
              'What to buy? When to go? How to get there? Divide the tasks',
            ],
            tip: 'Make suggestions, reject ideas (politely!), find compromises and reach an agreement. Interaction is assessed.',
          },
          {
            num: 'Teil 2',
            title: 'Present a topic',
            type: 'Monologue · 5 required sections',
            count: '≈ 3–4 Min per candidate',
            playback: null,
            themes: [
              '1. Introduction & structure of your presentation',
              '2. Your own experience with the topic',
              '3. The situation in your home country',
              '4. Pros and cons + your opinion',
              '5. Conclusion & thanks to the audience',
            ],
            tip: 'During the prep time (15 min) you choose between 2 topics. Structure is required — all 5 sections must appear. Notes allowed, no dictionary.',
          },
          {
            num: 'Teil 3',
            title: 'Discuss the topic',
            type: 'Follow-up questions & response',
            count: '≈ 2 Min per candidate',
            playback: null,
            themes: [
              "Give brief feedback on your partner's presentation",
              'Ask your partner a question',
              'Answer a question from your partner',
              'Answer a question from the examiner',
            ],
            tip: "After your partner's presentation: brief feedback + ask 1 question. After your own presentation: answer 1 question from your partner + 1 from the examiner.",
          },
        ],
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────────────── */
function PlaybackBadge({ text }: { text: string }) {
  const warn = text.includes('only');
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
      background: warn ? 'var(--red-bg, #fef2f2)' : 'var(--blue-bg)',
      color: warn ? '#dc2626' : 'var(--blue)',
      border: `1px solid ${warn ? '#fecaca' : 'var(--blue-bd)'}`,
      flexShrink: 0,
    }}>🔉 {text}</span>
  );
}

function TeilCard({ teil, accentColor }: {
  teil: { num: string; title: string; type: string; count: string; playback: string | null; themes: string[]; tip: string };
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden',
      boxShadow: open ? 'var(--sh-md)' : 'var(--sh)', transition: 'box-shadow .15s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: open ? accentColor : 'var(--bg)', border: 'none', cursor: 'pointer',
          textAlign: 'left', transition: 'background .15s', fontFamily: 'inherit',
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, flexShrink: 0,
          background: open ? 'rgba(255,255,255,.2)' : 'var(--faint)',
          color: open ? '#fff' : 'var(--muted)',
        }}>{teil.num}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: open ? '#fff' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teil.title}</span>
        <span className="pruef-teil-count" style={{ fontSize: 11, color: open ? 'rgba(255,255,255,.7)' : 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{teil.count}</span>
        <svg style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={open ? '#fff' : 'currentColor'} strokeWidth="2">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: '14px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          {/* Type + playback chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'var(--blue-bg)', color: 'var(--blue)', fontWeight: 600 }}>
              {teil.type}
            </span>
            {teil.playback && <PlaybackBadge text={teil.playback} />}
          </div>

          {/* Themes */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
              Topics / Format
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {teil.themes.map((t, i) => (
                <span key={i} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--ink2)', lineHeight: 1.5 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)', borderRadius: 7, padding: '9px 12px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginRight: 6 }}>💡 Tip:</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>{teil.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamSection({ exam }: { exam: typeof EXAMS[0] }) {
  const [activeTab, setActiveTab] = useState(0);
  const part = exam.parts[activeTab];

  return (
    <div style={{ border: `1px solid ${exam.bd}`, borderRadius: 14, background: exam.bg, overflow: 'hidden' }}>
      {/* Level header */}
      <div className="pruef-exam-header" style={{ padding: '14px 16px', borderBottom: `1px solid ${exam.bd}`, display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 100, background: exam.badge.bg, color: exam.badge.color, flexShrink: 0 }}>
          {exam.level}
        </span>
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 15, fontWeight: 700, color: exam.color, flex: 1, minWidth: 120 }}>
          {exam.fullName}
        </span>
        <div className="pruef-exam-badges" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            ⏱ {exam.totalTime}
          </span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            🏆 {exam.totalPts}
          </span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            👥 {exam.setup}
          </span>
        </div>
      </div>

      {/* Part tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${exam.bd}`, overflowX: 'auto' }}>
        {exam.parts.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: activeTab === i ? 700 : 500,
              background: activeTab === i ? '#fff' : 'transparent',
              color: activeTab === i ? exam.color : 'var(--muted)',
              borderBottom: activeTab === i ? `2px solid ${exam.color}` : '2px solid transparent',
              transition: 'all .15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
            <span className="pruef-tab-time" style={{ fontSize: 10, opacity: .65 }}>({p.time})</span>
          </button>
        ))}
      </div>

      {/* Part content */}
      <div style={{ padding: '18px 20px', background: '#fff' }}>
        {/* Part overview */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 10px' }}>{part.desc}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: exam.bg, color: exam.color, fontWeight: 600, border: `1px solid ${exam.bd}` }}>
              ⏱ {part.time}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              🏆 {part.pts}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              📝 {part.questions}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              {part.teile.length} Teile
            </span>
          </div>
        </div>

        {/* Teil cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {part.teile.map(teil => (
            <TeilCard key={teil.num} teil={teil} accentColor={exam.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────── */
export default function PruefungsinfoPage() {
  return (
    <>
      <Topbar title="Exam Info" />
      <div className="pruef-page" style={{ maxWidth: 880, margin: '0 auto', overflowX: 'hidden' }}>

        {/* Hero */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 26, fontWeight: 700, marginBottom: 6, overflowWrap: 'break-word' }}>
            Goethe-Zertifikat — Complete Exam Structure
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            Official task types, scores and tips for A1, A2 and B1. Tap each Teil to see the details.
          </p>
        </div>

        {/* Pass banner */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>📌 Passing criteria (all levels)</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
            At least <strong>60 of 100 points</strong> overall <em>and</em> at least <strong>45&nbsp;%</strong> in each individual exam part (Lesen, Hören, Schreiben, Sprechen).
            A poor result in just one part can cause you to fail overall.
          </div>
        </div>

        {/* Crucial tip: task fulfillment */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--blue)', marginBottom: 4 }}>⭐ The most important tip for all levels</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
            Examiners assess not only grammar and vocabulary — they assess <strong>task fulfilment</strong>.
            You <em>must</em> address every listed content point. Perfect German with missing points = lost marks.
          </div>
        </div>

        {/* Quick overview table */}
        <div className="pruef-overview-wrap" style={{ marginBottom: 28, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="pruef-table-scroll" style={{ overflowX: 'hidden' }}>
            <div className="pruef-ovw-inner" style={{ width: '100%' }}>
              <div className="pruef-ovw-row" style={{ display: 'grid', gridTemplateColumns: '0.55fr 1fr 1fr 1fr 1fr', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Level', 'Lesen', 'Hören', 'Schreiben', 'Sprechen'].map(h => (
                  <div key={h} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', overflowWrap: 'break-word' }}>{h}</div>
                ))}
              </div>
              {[
                { level: 'A1', color: '#15803d', bg: '#f0fdf4', cols: ['25 Min · 15 pts · 3 Teile', '20 Min · 15 pts · 3 Teile', '20 Min · 15 pts · 2 Teile', '15 Min · 15 pts · 3 Teile'] },
                { level: 'A2', color: '#1d4ed8', bg: '#eff6ff', cols: ['30 Min · 20 pts · 4 Teile', '30 Min · 20 pts · 4 Teile', '30 Min · 20 pts · 2 Teile', '15 Min · 25 pts · 3 Teile'] },
                { level: 'B1', color: '#7c3aed', bg: '#f5f3ff', cols: ['65 Min · 30 pts · 5 Teile', '40 Min · 30 pts · 4 Teile', '60 Min · 100 pts* · 3 Teile', '15 Min · 100 pts* · 3 Teile'] },
              ].map((row, ri) => (
                <div key={row.level} className="pruef-ovw-row" style={{ display: 'grid', gridTemplateColumns: '0.55fr 1fr 1fr 1fr 1fr', borderBottom: ri < 2 ? '1px solid var(--border)' : 'none', background: row.bg }}>
                  <div style={{ padding: '10px 6px', fontWeight: 800, color: row.color, fontSize: 14, fontFamily: 'var(--font-lora)' }}>{row.level}</div>
                  {row.cols.map((c, ci) => (
                    <div key={ci} style={{ padding: '9px 6px', fontSize: 10.5, color: 'var(--ink2)', lineHeight: 1.45, overflowWrap: 'break-word' }}>{c}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            * B1 Schreiben and Sprechen are scaled to 100 points.
          </div>
        </div>

        {/* Speaking exam note */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>🗣 Sprechen — exam format by level</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.8 }}>
            <strong style={{ color: '#15803d' }}>A1:</strong> Groups (3–4 candidates) ·
            <strong style={{ color: '#1d4ed8' }}> A2:</strong> Pairs (2 candidates) ·
            <strong style={{ color: '#7c3aed' }}> B1:</strong> Pairs + 15 minutes of prep time beforehand (notes allowed, no dictionary, no phone).<br/>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tip: interaction is assessed. If your partner gets stuck, help them. If you did not understand something, ask: <em>&quot;Könntest du das bitte wiederholen?&quot;</em></span>
          </div>
        </div>

        {/* Exam sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {EXAMS.map(exam => (
            <ExamSection key={exam.level} exam={exam} />
          ))}
        </div>
      </div>
    </>
  );
}
