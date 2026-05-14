import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("20082008o", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      name: "Admin",
      surname: "CodeLearn",
      email: "admin",
      password: adminPassword,
      role: "ADMIN",
      city: "Tashkent",
      level: 3,
      points: 99999,
      language: "RU",
    },
  });

  // Users
  await prisma.user.upsert({
    where: { email: "ivan@example.com" },
    update: {},
    create: {
      name: "Иван",
      surname: "Петров",
      email: "ivan@example.com",
      password: userPassword,
      city: "Москва",
      school: "Школа №1",
      grade: "10",
      level: 2,
      points: 2450,
      language: "RU",
    },
  });

  await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      name: "Мария",
      surname: "Сидорова",
      email: "maria@example.com",
      password: userPassword,
      city: "Санкт-Петербург",
      school: "Лицей №5",
      grade: "11",
      level: 3,
      points: 6200,
      language: "RU",
    },
  });

  await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Алексей",
      surname: "Смирнов",
      email: "alex@example.com",
      password: userPassword,
      city: "Казань",
      school: "Гимназия №3",
      grade: "9",
      level: 1,
      points: 1200,
      language: "RU",
    },
  });

  // Tasks
  const tasksData = [
    {
      title: "SELECT основы",
      description: "Напишите SQL запрос, который выбирает все записи из таблицы users, где возраст больше 18.",
      category: "SQL",
      difficulty: 20,
      points: 100,
      languages: JSON.stringify(["SQL"]),
      solutions: JSON.stringify({ SQL: "SELECT * FROM users WHERE age > 18" }),
    },
    {
      title: "JOIN таблицы",
      description: "Напишите SQL запрос с JOIN для объединения таблиц orders и customers. Выведите имя клиента и сумму заказа.",
      category: "SQL",
      difficulty: 45,
      points: 200,
      languages: JSON.stringify(["SQL"]),
      solutions: JSON.stringify({ SQL: "SELECT c.name, o.amount FROM orders o JOIN customers c ON o.customer_id = c.id" }),
    },
    {
      title: "Списки в Python",
      description: "Напишите функцию, которая принимает список чисел и возвращает только чётные числа.",
      category: "Python",
      difficulty: 30,
      points: 150,
      languages: JSON.stringify(["PYTHON"]),
      solutions: JSON.stringify({ PYTHON: "def filter_even(numbers):\n    return [n for n in numbers if n % 2 == 0]" }),
    },
    {
      title: "GROUP BY и агрегация",
      description: "Подсчитайте количество заказов для каждого клиента, выведите только тех, у кого больше 3 заказов.",
      category: "SQL",
      difficulty: 55,
      points: 250,
      languages: JSON.stringify(["SQL"]),
      solutions: JSON.stringify({ SQL: "SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id HAVING COUNT(*) > 3" }),
    },
    {
      title: "Подзапросы",
      description: "Найдите всех сотрудников, чья зарплата выше средней.",
      category: "SQL",
      difficulty: 60,
      points: 300,
      languages: JSON.stringify(["SQL"]),
      solutions: JSON.stringify({ SQL: "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)" }),
    },
    {
      title: "Hello World на Java",
      description: "Напишите программу на Java, которая выводит 'Hello, World!' в консоль.",
      category: "Java",
      difficulty: 10,
      points: 50,
      languages: JSON.stringify(["JAVA"]),
      solutions: JSON.stringify({ JAVA: "public class Main { public static void main(String[] args) { System.out.println(\"Hello, World!\"); } }" }),
    },
    {
      title: "Массивы в C++",
      description: "Найдите максимальный элемент в массиве целых чисел.",
      category: "C++",
      difficulty: 35,
      points: 150,
      languages: JSON.stringify(["CPP"]),
      solutions: JSON.stringify({ CPP: "#include <iostream>\nusing namespace std;\nint main() { int arr[] = {3,7,1,9,4}; int mx=arr[0]; for(int i=1;i<5;i++) if(arr[i]>mx) mx=arr[i]; cout<<mx; }" }),
    },
    {
      title: "Express маршруты",
      description: "Напишите обработчик маршрута на Node.js, который возвращает JSON с приветствием.",
      category: "Node.js",
      difficulty: 25,
      points: 120,
      languages: JSON.stringify(["NODEJS"]),
      solutions: JSON.stringify({ NODEJS: "app.get('/hello/:name', (req, res) => { res.json({ message: `Hello, ${req.params.name}!` }); });" }),
    },
  ];

  for (const task of tasksData) {
    await prisma.task.create({ data: task });
  }

  console.log("Seed completed!");
  console.log("Admin: admin@codelearn.uz / admin123");
  console.log("Users: ivan@example.com, maria@example.com, alex@example.com / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
