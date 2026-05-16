import { type Prisma, type PrismaClient } from "../generated/prisma/client.js";

function daysAgo(days: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function daysFromNow(days: number, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function createDemoApplicationsSeed(): Prisma.ApplicationCreateInput[] {
  return [
    {
      companyName: "Northstar Labs",
      jobTitle: "Frontend Developer",
      city: "Berlin",
      remoteType: "hybrid",
      source: "LinkedIn",
      jobUrl: "https://example.com/jobs/northstar-frontend-developer",
      status: "interview",
      foundAt: daysAgo(16, 18, 15),
      appliedAt: daysAgo(14, 10, 30),
      lastContactAt: daysAgo(2, 15, 0),
      followUpAt: daysFromNow(3, 10, 0),
      cvVersion: "Tailored v3",
      coverLetterVersion: "Northstar draft",
      usedCoverLetter: true,
      customizationNotes:
        "Emphasized design system work, accessibility audits, and component ownership.",
      notes:
        "Recruiter screen went well. Next step is the technical interview with the product team.",
      interestRating: 5,
      skillFitRating: 4,
      priorityRating: 5,
      contacts: {
        create: [
          {
            name: "Lena Fischer",
            role: "Talent Partner",
            email: "lena.fischer@northstarlabs.example",
          },
          {
            name: "Mateo Klein",
            role: "Engineering Manager",
            email: "mateo.klein@northstarlabs.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(16, 18, 15),
            note: "Saved after spotting the role on LinkedIn.",
          },
          {
            status: "applied",
            changedAt: daysAgo(14, 10, 30),
            note: "Submitted tailored resume and cover letter.",
          },
          {
            status: "interview",
            changedAt: daysAgo(2, 15, 0),
            note: "Invited to a technical interview next week.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(14, 10, 30),
            type: "application",
            direction: "outbound",
            summary: "Applied through the company careers page.",
          },
          {
            date: daysAgo(2, 15, 0),
            type: "email",
            direction: "inbound",
            summary: "Interview invitation received.",
            body: "Invited for a 60-minute technical interview with the product team.",
          },
        ],
      },
    },
    {
      companyName: "Atlas Commerce",
      jobTitle: "Full-Stack Engineer",
      city: "Hamburg",
      remoteType: "remote",
      source: "Company website",
      jobUrl: "https://example.com/jobs/atlas-commerce-full-stack-engineer",
      status: "technical_task",
      foundAt: daysAgo(11, 19, 20),
      appliedAt: daysAgo(10, 9, 15),
      lastContactAt: daysAgo(1, 11, 0),
      followUpAt: daysFromNow(5, 14, 0),
      cvVersion: "Generalist v2",
      usedCoverLetter: false,
      customizationNotes:
        "Highlighted React, Node.js, and shipping internal tooling with measurable impact.",
      notes:
        "Take-home task is due Friday. Scope looks reasonable and close to prior dashboard work.",
      interestRating: 4,
      skillFitRating: 5,
      priorityRating: 4,
      contacts: {
        create: [
          {
            name: "Jonas Becker",
            role: "Senior Recruiter",
            email: "jonas.becker@atlascommerce.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(11, 19, 20),
            note: "Saved from the company careers page.",
          },
          {
            status: "applied",
            changedAt: daysAgo(10, 9, 15),
            note: "Submitted application and portfolio.",
          },
          {
            status: "technical_task",
            changedAt: daysAgo(1, 11, 0),
            note: "Received take-home assignment.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(10, 9, 15),
            type: "application",
            direction: "outbound",
            summary: "Applied with portfolio and project links.",
          },
          {
            date: daysAgo(1, 11, 0),
            type: "email",
            direction: "inbound",
            summary: "Take-home assignment received.",
            body: "Build a compact analytics page and document tradeoffs.",
          },
        ],
      },
    },
    {
      companyName: "Cedar Analytics",
      jobTitle: "Data Visualization Engineer",
      city: "Munich",
      remoteType: "hybrid",
      source: "Referral",
      status: "offer",
      foundAt: daysAgo(24, 17, 45),
      appliedAt: daysAgo(22, 8, 50),
      lastContactAt: daysAgo(0, 9, 10),
      followUpAt: daysFromNow(2, 16, 0),
      cvVersion: "Data-viz v1",
      coverLetterVersion: "Referral intro",
      usedCoverLetter: true,
      customizationNotes:
        "Focused on dashboard storytelling, TypeScript depth, and cross-functional delivery.",
      notes:
        "Offer received. Need to review salary details and prepare follow-up questions.",
      interestRating: 5,
      skillFitRating: 5,
      priorityRating: 5,
      contacts: {
        create: [
          {
            name: "Priya Shah",
            role: "Head of Product Analytics",
            email: "priya.shah@cedaranalytics.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(24, 17, 45),
            note: "Referred by a former teammate.",
          },
          {
            status: "applied",
            changedAt: daysAgo(22, 8, 50),
            note: "Sent application package and portfolio.",
          },
          {
            status: "interview",
            changedAt: daysAgo(12, 14, 0),
            note: "Completed team panel interview.",
          },
          {
            status: "offer",
            changedAt: daysAgo(0, 9, 10),
            note: "Offer shared over email.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(12, 14, 0),
            type: "meeting",
            direction: "inbound",
            summary: "Panel interview completed.",
          },
          {
            date: daysAgo(0, 9, 10),
            type: "email",
            direction: "inbound",
            summary: "Offer package received.",
            body: "Received salary details, benefits overview, and next-step timeline.",
          },
        ],
      },
    },
    {
      companyName: "Bluebird Studio",
      jobTitle: "UI Engineer",
      city: "Cologne",
      remoteType: "onsite",
      source: "Indeed",
      jobUrl: "https://example.com/jobs/bluebird-studio-ui-engineer",
      status: "applied",
      foundAt: daysAgo(6, 13, 30),
      appliedAt: daysAgo(5, 8, 40),
      lastContactAt: daysAgo(5, 8, 40),
      followUpAt: daysFromNow(4, 9, 30),
      cvVersion: "Frontend v5",
      coverLetterVersion: "Creative teams",
      usedCoverLetter: true,
      customizationNotes:
        "Leaned into UI craft, collaboration with designers, and accessibility polish.",
      notes:
        "Fresh application with no response yet. Follow-up reminder is already scheduled.",
      interestRating: 4,
      skillFitRating: 4,
      priorityRating: 3,
      contacts: {
        create: [
          {
            name: "Sofia Weber",
            role: "People Operations",
            email: "sofia.weber@bluebirdstudio.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(6, 13, 30),
            note: "Saved after browsing design-focused roles.",
          },
          {
            status: "applied",
            changedAt: daysAgo(5, 8, 40),
            note: "Sent application and portfolio link.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(5, 8, 40),
            type: "application",
            direction: "outbound",
            summary: "Submitted application through Indeed redirect.",
          },
        ],
      },
    },
    {
      companyName: "Harbor Health",
      jobTitle: "Product Engineer",
      city: "Remote",
      remoteType: "remote",
      source: "Wellfound",
      jobUrl: "https://example.com/jobs/harbor-health-product-engineer",
      status: "rejected",
      foundAt: daysAgo(20, 20, 5),
      appliedAt: daysAgo(18, 9, 0),
      lastContactAt: daysAgo(4, 16, 20),
      cvVersion: "Product v4",
      usedCoverLetter: false,
      customizationNotes:
        "Highlighted startup pace, product thinking, and feature ownership end to end.",
      notes:
        "Rejected after first interview. Kept for demo purposes to show completed history.",
      interestRating: 3,
      skillFitRating: 4,
      priorityRating: 2,
      contacts: {
        create: [
          {
            name: "Emily Carter",
            role: "Recruiting Coordinator",
            email: "emily.carter@harborhealth.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(20, 20, 5),
            note: "Saved from Wellfound.",
          },
          {
            status: "applied",
            changedAt: daysAgo(18, 9, 0),
            note: "Applied with startup-focused resume.",
          },
          {
            status: "interview",
            changedAt: daysAgo(8, 10, 0),
            note: "Completed intro call with hiring manager.",
          },
          {
            status: "rejected",
            changedAt: daysAgo(4, 16, 20),
            note: "Received rejection email after first round.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(8, 10, 0),
            type: "meeting",
            direction: "inbound",
            summary: "First-round interview completed.",
          },
          {
            date: daysAgo(4, 16, 20),
            type: "email",
            direction: "inbound",
            summary: "Rejection email received.",
            body: "They decided to move forward with another candidate.",
          },
        ],
      },
    },
    {
      companyName: "Orbit Systems",
      jobTitle: "Platform Engineer",
      city: "Frankfurt",
      remoteType: "hybrid",
      source: "Recruiter outreach",
      status: "interesting",
      foundAt: daysAgo(3, 12, 25),
      lastContactAt: daysAgo(3, 12, 25),
      followUpAt: daysFromNow(2, 11, 0),
      notes:
        "Interesting scope around internal tooling and platform reliability. Need to research the company more before applying.",
      interestRating: 4,
      skillFitRating: 3,
      priorityRating: 3,
      contacts: {
        create: [
          {
            name: "Daniel Roth",
            role: "External Recruiter",
            email: "daniel.roth@talentbridge.example",
            phone: "+49 151 555 0192",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(3, 12, 25),
            note: "Saved after recruiter outreach.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(3, 12, 25),
            type: "linkedin",
            direction: "inbound",
            summary: "Recruiter reached out about the platform engineer role.",
          },
        ],
      },
    },
    {
      companyName: "Maple Fintech",
      jobTitle: "Product Frontend Engineer",
      city: "Stuttgart",
      remoteType: "hybrid",
      source: "LinkedIn",
      jobUrl: "https://example.com/jobs/maple-fintech-product-frontend-engineer",
      status: "confirmation_received",
      foundAt: daysAgo(2, 8, 45),
      appliedAt: daysAgo(1, 9, 20),
      lastContactAt: daysAgo(1, 13, 10),
      followUpAt: daysAgo(1, 17, 0),
      cvVersion: "Frontend v5",
      coverLetterVersion: "Fintech product angle",
      usedCoverLetter: true,
      customizationNotes:
        "Focused on product iteration speed, data-heavy UI, and collaboration with design.",
      notes:
        "Confirmation email came in the same day. Follow-up is intentionally set for that day to showcase overdue reminders.",
      interestRating: 4,
      skillFitRating: 4,
      priorityRating: 4,
      contacts: {
        create: [
          {
            name: "Nina Baumann",
            role: "Recruiting Specialist",
            email: "nina.baumann@maplefintech.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(2, 8, 45),
            note: "Saved after spotting the role on LinkedIn.",
          },
          {
            status: "applied",
            changedAt: daysAgo(1, 9, 20),
            note: "Applied with a tailored frontend portfolio.",
          },
          {
            status: "confirmation_received",
            changedAt: daysAgo(1, 13, 10),
            note: "Automatic confirmation received from the hiring team.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(1, 9, 20),
            type: "application",
            direction: "outbound",
            summary: "Submitted application through the careers portal.",
          },
          {
            date: daysAgo(1, 13, 10),
            type: "email",
            direction: "inbound",
            summary: "Application confirmation received.",
            body: "The team confirmed receipt and said they would review applications this week.",
          },
        ],
      },
    },
    {
      companyName: "Summit Cloud",
      jobTitle: "Frontend Platform Engineer",
      city: "Leipzig",
      remoteType: "remote",
      source: "Company website",
      jobUrl: "https://example.com/jobs/summit-cloud-frontend-platform-engineer",
      status: "no_response",
      foundAt: daysAgo(12, 18, 10),
      appliedAt: daysAgo(10, 10, 0),
      lastContactAt: daysAgo(10, 10, 0),
      followUpAt: daysAgo(1, 11, 30),
      cvVersion: "Platform v2",
      usedCoverLetter: false,
      customizationNotes:
        "Highlighted React infrastructure work, shared tooling, and developer experience improvements.",
      notes:
        "No reply so far. Follow-up date is yesterday so the dashboard can surface an overdue item in demo mode.",
      interestRating: 4,
      skillFitRating: 3,
      priorityRating: 3,
      contacts: {
        create: [
          {
            name: "Tobias Lang",
            role: "People Partner",
            email: "tobias.lang@summitcloud.example",
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: "interesting",
            changedAt: daysAgo(12, 18, 10),
            note: "Saved from the company careers page.",
          },
          {
            status: "applied",
            changedAt: daysAgo(10, 10, 0),
            note: "Applied with resume and selected project links.",
          },
          {
            status: "no_response",
            changedAt: daysAgo(1, 11, 30),
            note: "Marked as no response after the follow-up window passed.",
          },
        ],
      },
      communications: {
        create: [
          {
            date: daysAgo(10, 10, 0),
            type: "application",
            direction: "outbound",
            summary: "Submitted application through the company website.",
          },
          {
            date: daysAgo(1, 11, 30),
            type: "note",
            direction: "outbound",
            summary: "Follow-up reminder became overdue with no answer yet.",
          },
        ],
      },
    },
  ];
}

export async function resetDemoState(prisma: PrismaClient) {
  const demoApplications = createDemoApplicationsSeed();

  return prisma.$transaction(async tx => {
    await tx.application.deleteMany();

    for (const application of demoApplications) {
      await tx.application.create({ data: application });
    }

    return tx.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contacts: true,
        statusHistory: {
          orderBy: { changedAt: "desc" },
        },
        communications: {
          orderBy: { date: "desc" },
        },
      },
    });
  });
}
