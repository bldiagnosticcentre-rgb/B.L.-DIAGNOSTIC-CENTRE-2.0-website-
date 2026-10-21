import { PrismaClient } from '@prisma/client';
import { OFFICIAL_25_TESTS, OFFICIAL_CATEGORIES } from '../src/data/officialTests.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding official categories and 25 diagnostic tests into Neon PostgreSQL...');

  // 1. Seed categories
  for (let i = 0; i < OFFICIAL_CATEGORIES.length; i++) {
    const catName = OFFICIAL_CATEGORIES[i];
    if (catName === 'All Tests') continue;
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.category.upsert({
      where: { name: catName },
      update: { displayOrder: i },
      create: {
        name: catName,
        slug,
        description: `Official laboratory diagnostic category for ${catName}`,
        displayOrder: i
      }
    });
  }

  // 2. Seed 25 official tests
  for (const test of OFFICIAL_25_TESTS) {
    await prisma.test.upsert({
      where: { code: test.code },
      update: {
        serialNo: test.serialNo,
        shortName: test.shortName || test.code,
        name: test.name,
        categoryName: test.category,
        method: test.method,
        sample: test.sample,
        instructions: test.instructions,
        description: test.description,
        reportingTime: test.reportingTime,
        generalPrice: test.generalPrice,
        corporatePrice: test.corporatePrice,
        active: test.active,
        verified: test.verified,
        verificationNote: test.verificationNote,
        isOfficialCatalogue: true,
        popular: Boolean(test.popular)
      },
      create: {
        id: test.id,
        serialNo: test.serialNo,
        code: test.code,
        shortName: test.shortName || test.code,
        name: test.name,
        categoryName: test.category,
        method: test.method,
        sample: test.sample,
        instructions: test.instructions,
        description: test.description,
        reportingTime: test.reportingTime,
        generalPrice: test.generalPrice,
        corporatePrice: test.corporatePrice,
        homeCollectionAvailable: true,
        active: test.active,
        verified: test.verified,
        verificationNote: test.verificationNote,
        isOfficialCatalogue: true,
        popular: Boolean(test.popular)
      }
    });
    console.log(`Seeded test #${test.serialNo}: ${test.name} (${test.shortName}) - ₹${test.generalPrice ?? 'N/A'}`);
  }

  console.log('All 25 official diagnostic tests seeded successfully into database!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
