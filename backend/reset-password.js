// Скрипт для сброса пароля администратора
// Использование: node reset-password.js <email> <новый_пароль>
// Пример: node reset-password.js admin123 newpassword123

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Использование: node reset-password.js <email> <новый_пароль>');
    console.log('Пример: node reset-password.js admin123 myNewPassword');
    console.log('');
    console.log('Текущие пользователи:');
    const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
    users.forEach(u => console.log(`  ${u.email} (${u.name}) - ${u.role}`));
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`Пользователь с email "${email}" не найден!`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  console.log(`Пароль для "${email}" успешно изменён!`);
  await prisma.$disconnect();
}

main();
