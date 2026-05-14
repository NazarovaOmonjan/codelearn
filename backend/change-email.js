// Скрипт для смены email/логина пользователя
// Использование: node change-email.js <старый_email> <новый_email>
// Пример: node change-email.js admin123 myadmin

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oldEmail = process.argv[2];
  const newEmail = process.argv[3];

  if (!oldEmail || !newEmail) {
    console.log('Использование: node change-email.js <старый_email> <новый_email>');
    console.log('Пример: node change-email.js admin123 myadmin');
    console.log('');
    console.log('Текущие пользователи:');
    const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
    users.forEach(u => console.log(`  ${u.email} (${u.name}) - ${u.role}`));
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: oldEmail } });
  if (!user) {
    console.log(`Пользователь с email "${oldEmail}" не найден!`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email: oldEmail }, data: { email: newEmail } });
  console.log(`Email изменён: "${oldEmail}" → "${newEmail}"`);
  await prisma.$disconnect();
}

main();
