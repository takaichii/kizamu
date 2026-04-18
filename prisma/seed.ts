import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      name: "開発ユーザー",
    },
  });

  const health = await prisma.lifeOrientation.upsert({
    where: { id: "orientation-health" },
    update: {},
    create: {
      id: "orientation-health",
      userId: user.id,
      title: "健康",
      description: "心身ともに健康でいること",
    },
  });

  const growth = await prisma.lifeOrientation.upsert({
    where: { id: "orientation-growth" },
    update: {},
    create: {
      id: "orientation-growth",
      userId: user.id,
      title: "成長",
      description: "継続的に学び、スキルを磨くこと",
    },
  });

  const adventure = await prisma.lifeOrientation.upsert({
    where: { id: "orientation-adventure" },
    update: {},
    create: {
      id: "orientation-adventure",
      userId: user.id,
      title: "冒険",
      description: "新しい体験を積極的に求めること",
    },
  });

  await prisma.bucketItem.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "bucket-marathon",
        userId: user.id,
        title: "フルマラソン完走",
        description: "42.195kmを完走する",
        category: "運動",
        status: "inProgress",
        orientationId: health.id,
      },
      {
        id: "bucket-book",
        userId: user.id,
        title: "年間50冊読書",
        description: "ジャンルを問わず50冊読む",
        category: "学習",
        status: "dream",
        orientationId: growth.id,
      },
      {
        id: "bucket-japan",
        userId: user.id,
        title: "日本一周",
        description: "47都道府県を訪れる",
        category: "旅行",
        status: "dream",
        orientationId: adventure.id,
      },
      {
        id: "bucket-oss",
        userId: user.id,
        title: "OSSにコントリビュート",
        description: "実用的なPRをマージしてもらう",
        category: "技術",
        status: "done",
        doneAt: new Date("2024-06-15"),
        orientationId: growth.id,
      },
    ],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {},
    create: {
      userId: user.id,
      date: today,
      mood: 4,
      summary: "Prismaシードスクリプトを実装した。開発環境のセットアップが楽になりそう。",
      tomorrowNote: "PRを作成してレビュー依頼を出す",
      achievements: {
        create: [
          {
            text: "Prismaシードスクリプトを作成した",
            tags: ["開発", "環境整備"],
            isQuick: false,
          },
          {
            text: "技術調査でNode.js 24のネイティブTS対応を確認した",
            tags: ["学習", "技術"],
            isQuick: true,
          },
        ],
      },
    },
  });

  await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: user.id, date: yesterday } },
    update: {},
    create: {
      userId: user.id,
      date: yesterday,
      mood: 3,
      summary: "既存機能のバグを修正して、テストを追加した。",
      tomorrowNote: "シードスクリプトの実装を進める",
      achievements: {
        create: [
          {
            text: "チェックイン画面のUIを改善した",
            tags: ["フロントエンド", "UI"],
            isQuick: false,
          },
        ],
      },
    },
  });

  const mandala = await prisma.quarterlyMandala.upsert({
    where: { userId_year_quarter: { userId: user.id, year: 2026, quarter: 2 } },
    update: {},
    create: {
      userId: user.id,
      year: 2026,
      quarter: 2,
      centerTheme: "充実した毎日",
      cells: {
        create: [
          { position: 0, title: "健康維持", orientationId: health.id },
          { position: 1, title: "週3回運動", bucketItemId: "bucket-marathon" },
          { position: 2, title: "食事管理", orientationId: health.id },
          { position: 3, title: "スキルアップ", orientationId: growth.id },
          { position: 4, title: "充実した毎日" },
          { position: 5, title: "読書習慣", bucketItemId: "bucket-book" },
          { position: 6, title: "旅行計画", orientationId: adventure.id },
          { position: 7, title: "新しい趣味", orientationId: adventure.id },
          { position: 8, title: "OSS活動継続", bucketItemId: "bucket-oss" },
        ],
      },
    },
  });

  console.log("✅ Seed completed");
  console.log(`   User: ${user.email}`);
  console.log(`   LifeOrientations: 3`);
  console.log(`   BucketItems: 4`);
  console.log(`   DailyEntries: 2`);
  console.log(`   QuarterlyMandala: ${mandala.year} Q${mandala.quarter}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
