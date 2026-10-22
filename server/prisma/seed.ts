import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'ayush.iyer@doseloop.app' },
    update: {},
    create: {
      email: 'ayush.iyer@doseloop.app',
      firstName: 'Ayush',
      lastName: 'Iyer',
      plan: 'Self-managing patient',
    },
  });

  console.log(`Created test user: ${user.email}`);

  // Medications
  const meds = [
    {
      id: 'm1',
      name: 'Lisinopril',
      dosage: '10 mg',
      form: 'PILL' as const,
      critical: true,
      notes: 'Take with water, before breakfast.',
      refillIn: 6,
      color: 'var(--color-primary)',
      userId: user.id,
      schedule: { time: '08:00', frequency: 'daily' }
    },
    {
      id: 'm2',
      name: 'Metformin',
      dosage: '500 mg',
      form: 'PILL' as const,
      critical: true,
      notes: 'With food to reduce stomach upset.',
      refillIn: 12,
      color: 'var(--color-success)',
      userId: user.id,
      schedule: { time: '08:00', frequency: 'twice daily' }
    },
    {
      id: 'm3',
      name: 'Atorvastatin',
      dosage: '20 mg',
      form: 'PILL' as const,
      critical: false,
      notes: 'Take at bedtime.',
      refillIn: 21,
      color: 'var(--color-info)',
      userId: user.id,
      schedule: { time: '20:00', frequency: 'daily' }
    },
    {
      id: 'm4',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      form: 'PILL' as const,
      critical: false,
      notes: null,
      refillIn: 30,
      color: 'var(--color-warning)',
      userId: user.id,
      schedule: { time: '08:00', frequency: 'daily' }
    },
  ];

  for (const med of meds) {
    const { schedule, ...medData } = med;
    await prisma.medication.upsert({
      where: { id: med.id },
      update: {},
      create: {
        ...medData,
        schedules: {
          create: [schedule]
        }
      },
    });
  }
  console.log(`Created ${meds.length} medications`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Doses
  const doses = [
    {
      id: 'd1',
      medicationId: 'm1',
      scheduledFor: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: 'TAKEN' as const,
    },
    {
      id: 'd2',
      medicationId: 'm2',
      scheduledFor: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: 'TAKEN' as const,
    },
    {
      id: 'd3',
      medicationId: 'm4',
      scheduledFor: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      status: 'SKIPPED' as const,
    },
    {
      id: 'd4',
      medicationId: 'm2',
      scheduledFor: new Date(today.getTime() + 20 * 60 * 60 * 1000),
      status: 'UPCOMING' as const,
    },
    {
      id: 'd5',
      medicationId: 'm3',
      scheduledFor: new Date(today.getTime() + 20 * 60 * 60 * 1000),
      status: 'UPCOMING' as const,
    },
  ];

  for (const dose of doses) {
    await prisma.doseEvent.upsert({
      where: { id: dose.id },
      update: {},
      create: dose,
    });
  }
  console.log(`Created ${doses.length} dose events`);

  // Wellness
  const wellness = [
    {
      id: 'w1',
      label: 'Water',
      icon: 'Droplets',
      value: 5,
      goal: 8,
      unit: 'glasses',
      tone: 'INFO' as const,
      userId: user.id,
    },
    {
      id: 'w2',
      label: 'Sleep',
      icon: 'Moon',
      value: 7.2,
      goal: 8,
      unit: 'hours',
      tone: 'PRIMARY' as const,
      userId: user.id,
    },
    {
      id: 'w3',
      label: 'Mood',
      icon: 'Smile',
      value: 4,
      goal: 5,
      unit: '/ 5',
      tone: 'ACCENT' as const,
      userId: user.id,
    },
    {
      id: 'w4',
      label: 'Steps',
      icon: 'Footprints',
      value: 4200,
      goal: 6000,
      unit: 'steps',
      tone: 'SUCCESS' as const,
      userId: user.id,
    },
  ];

  for (const well of wellness) {
    await prisma.wellnessMetric.upsert({
      where: { id: well.id },
      update: {},
      create: well,
    });
  }
  console.log(`Created ${wellness.length} wellness metrics`);

  // Family Members (Circle Members)
  const familyMembers = [
    {
      id: 'c1',
      name: 'Ananya Iyer',
      relation: 'Daughter',
      role: 'CONNECTED' as const,
      sharesMedication: true,
      sharesWellness: false,
      userId: user.id,
    },
    {
      id: 'c2',
      name: 'Sunita Iyer',
      relation: 'Wife',
      role: 'OWNER' as const,
      sharesMedication: true,
      sharesWellness: true,
      userId: user.id,
    },
    {
      id: 'c3',
      name: 'Rohan Iyer',
      relation: 'Son',
      role: 'OWNER' as const,
      sharesMedication: false,
      sharesWellness: true,
      userId: user.id,
    },
  ];

  for (const fm of familyMembers) {
    await prisma.familyMember.upsert({
      where: { id: fm.id },
      update: {},
      create: fm,
    });
  }
  console.log(`Created ${familyMembers.length} family members`);

  // Notifications
  const notifications = [
    {
      id: 'n1',
      title: 'Metformin is due',
      body: 'Your 8:00 PM dose with dinner. Tap to log when ready.',
      type: 'REMINDER' as const,
      isRead: false,
      userId: user.id,
    },
    {
      id: 'n2',
      title: 'Vitamin D3 was skipped',
      body: 'No worries — one missed dose happens. We logged it quietly.',
      type: 'SYSTEM' as const,
      isRead: false,
      userId: user.id,
    },
    {
      id: 'n3',
      title: 'Your daily digest is ready',
      body: "You're on track today. 2 of 4 doses logged, hydration a little behind.",
      type: 'DIGEST' as const,
      isRead: true,
      userId: user.id,
    },
    {
      id: 'n4',
      title: 'Ananya joined your Circle',
      body: "Ananya can now see your medication status. You control what's shared.",
      type: 'SYSTEM' as const,
      isRead: true,
      userId: user.id,
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: {},
      create: notif,
    });
  }
  console.log(`Created ${notifications.length} notifications`);

  // Chat History (Assistant Conversation)
  const conversation = await prisma.assistantConversation.upsert({
    where: { id: 'conv1' },
    update: {},
    create: {
      id: 'conv1',
      userId: user.id,
      title: 'Weekly Check-in',
    }
  });

  const chatMessages = [
    {
      id: 'a1',
      role: 'assistant',
      content:
        "Good evening, Ayush. You've taken 2 of 4 doses today and your blood-pressure medication is on schedule. One Metformin dose is coming up at 8:00 PM. Anything you'd like to review?",
      conversationId: conversation.id,
    },
    { id: 'a2', role: 'user', content: 'How did I do this week?', conversationId: conversation.id },
    {
      id: 'a3',
      role: 'assistant',
      content:
        "This week you logged 31 of 35 scheduled doses — that's 89% adherence, slightly up from last week. Friday was your only lighter day. Your hydration averaged 6 of 8 glasses. Would you like a tip to make evening doses easier to remember?",
      conversationId: conversation.id,
    },
  ];

  for (const msg of chatMessages) {
    await prisma.assistantMessage.upsert({
      where: { id: msg.id },
      update: {},
      create: msg,
    });
  }
  console.log(`Created ${chatMessages.length} chat messages`);

  // -------------------------------------------------------------
  // Seed Aman (Local Mode user matching usr_aman / local_token_aman)
  // -------------------------------------------------------------
  const aman = await prisma.user.upsert({
    where: { id: 'usr_aman' },
    update: {},
    create: {
      id: 'usr_aman',
      email: 'aman@doseloop.com',
      firstName: 'Aman',
      lastName: 'Kumar',
      role: 'ADMIN',
      plan: 'pro',
    },
  });
  console.log(`Created local user: ${aman.email} (${aman.id})`);

  const amanMeds = [
    {
      id: 'med_aman_1',
      name: 'Metformin',
      dosage: '500mg',
      form: 'PILL' as const,
      critical: true,
      color: '#3B82F6',
      notes: 'Take with food to reduce stomach upset',
      refillIn: 12,
      userId: aman.id,
      schedule: { time: '08:00', frequency: 'twice daily' },
    },
    {
      id: 'med_aman_2',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      form: 'PILL' as const,
      critical: false,
      color: '#F59E0B',
      notes: 'Morning with breakfast',
      refillIn: 25,
      userId: aman.id,
      schedule: { time: '09:00', frequency: 'daily' },
    },
    {
      id: 'med_aman_3',
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      form: 'PILL' as const,
      critical: false,
      color: '#10B981',
      notes: 'Night after dinner',
      refillIn: 18,
      userId: aman.id,
      schedule: { time: '21:00', frequency: 'daily' },
    },
  ];

  for (const med of amanMeds) {
    const { schedule, ...medData } = med;
    await prisma.medication.upsert({
      where: { id: med.id },
      update: {},
      create: {
        ...medData,
        schedules: { create: [schedule] },
      },
    });

    // Create upcoming and taken dose events for Aman
    await prisma.doseEvent.createMany({
      data: [
        {
          medicationId: med.id,
          scheduledFor: new Date(),
          status: 'TAKEN',
          takenAt: new Date(),
        },
        {
          medicationId: med.id,
          scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
          status: 'UPCOMING',
        },
      ],
      skipDuplicates: true,
    });
  }

  // Family members for Aman
  const amanFamily = [
    {
      id: 'fam_aman_1',
      name: 'Priya Sharma',
      relation: 'Sister',
      role: 'OWNER' as const,
      sharesMedication: true,
      sharesWellness: true,
      userId: aman.id,
    },
    {
      id: 'fam_aman_2',
      name: 'Rajesh Kumar',
      relation: 'Father',
      role: 'CONNECTED' as const,
      sharesMedication: true,
      sharesWellness: false,
      userId: aman.id,
    },
  ];

  for (const fm of amanFamily) {
    await prisma.familyMember.upsert({
      where: { id: fm.id },
      update: {},
      create: fm,
    });
  }

  // Emergency contact for Aman
  await prisma.emergencyContact.upsert({
    where: { id: 'emg_aman_1' },
    update: {},
    create: {
      id: 'emg_aman_1',
      name: 'Priya Sharma',
      relation: 'Sister',
      phone: '+91 98765 43210',
      email: 'priya@example.com',
      isPrimary: true,
      userId: aman.id,
    },
  });

  // Notifications for Aman
  await prisma.notification.upsert({
    where: { id: 'notif_aman_1' },
    update: {},
    create: {
      id: 'notif_aman_1',
      title: 'Afternoon Dose Reminder',
      body: 'Time to take Vitamin D3 (2000 IU)',
      type: 'REMINDER' as const,
      isRead: false,
      userId: aman.id,
    },
  });

  console.log('Successfully seeded complete datasets for Aman (usr_aman)');

  // -------------------------------------------------------------
  // Seed Realistic QA Identity: Aarav Sharma (Database generated UUID)
  // -------------------------------------------------------------
  const aarav = await prisma.user.upsert({
    where: { email: 'qa.aarav.sharma@example.com' },
    update: {},
    create: {
      email: 'qa.aarav.sharma@example.com',
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: 'USER',
      plan: 'pro',
    },
  });
  console.log(`Created realistic QA user: ${aarav.firstName} ${aarav.lastName} (${aarav.email}) -> ID: ${aarav.id}`);

  const aaravMeds = [
    {
      id: 'med_aarav_1',
      name: 'Atorvastatin',
      dosage: '20mg',
      form: 'PILL' as const,
      critical: true,
      color: '#0f766e',
      notes: 'Take at bedtime for cholesterol management',
      refillIn: 20,
      userId: aarav.id,
      schedule: { time: '21:00', frequency: 'daily' },
    },
    {
      id: 'med_aarav_2',
      name: 'Metformin',
      dosage: '500mg',
      form: 'PILL' as const,
      critical: true,
      color: '#3B82F6',
      notes: 'Take with lunch to avoid gastric upset',
      refillIn: 15,
      userId: aarav.id,
      schedule: { time: '13:00', frequency: 'daily' },
    },
    {
      id: 'med_aarav_3',
      name: 'CoQ10',
      dosage: '100mg',
      form: 'PILL' as const,
      critical: false,
      color: '#d4a373',
      notes: 'Morning supplement with healthy fats',
      refillIn: 28,
      userId: aarav.id,
      schedule: { time: '08:30', frequency: 'daily' },
    },
  ];

  for (const med of aaravMeds) {
    const { schedule, ...medData } = med;
    await prisma.medication.upsert({
      where: { id: med.id },
      update: {},
      create: {
        ...medData,
        schedules: { create: [schedule] },
      },
    });

    await prisma.doseEvent.createMany({
      data: [
        {
          medicationId: med.id,
          scheduledFor: new Date(),
          status: 'TAKEN',
          takenAt: new Date(),
        },
        {
          medicationId: med.id,
          scheduledFor: new Date(Date.now() + 5 * 60 * 60 * 1000),
          status: 'UPCOMING',
        },
      ],
      skipDuplicates: true,
    });
  }

  const aaravFamily = [
    {
      id: 'fam_aarav_1',
      name: 'Meera Sharma',
      relation: 'Spouse',
      role: 'OWNER' as const,
      sharesMedication: true,
      sharesWellness: true,
      userId: aarav.id,
    },
    {
      id: 'fam_aarav_2',
      name: 'Kabir Sharma',
      relation: 'Son',
      role: 'VIEWER' as const,
      sharesMedication: true,
      sharesWellness: false,
      userId: aarav.id,
    },
  ];

  for (const fm of aaravFamily) {
    await prisma.familyMember.upsert({
      where: { id: fm.id },
      update: {},
      create: fm,
    });
  }

  await prisma.emergencyContact.upsert({
    where: { id: 'emg_aarav_1' },
    update: {},
    create: {
      id: 'emg_aarav_1',
      name: 'Meera Sharma',
      relation: 'Spouse',
      phone: '+91 98111 22334',
      email: 'meera.sharma@example.com',
      isPrimary: true,
      userId: aarav.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notif_aarav_1' },
    update: {},
    create: {
      id: 'notif_aarav_1',
      title: 'Evening Atorvastatin',
      body: 'Time to take Atorvastatin (20mg) before sleep',
      type: 'REMINDER' as const,
      isRead: false,
      userId: aarav.id,
    },
  });

  console.log(`Successfully seeded QA identity: Aarav Sharma (${aarav.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
