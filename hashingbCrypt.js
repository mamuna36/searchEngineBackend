const bcrypt = require("bcrypt");
const db = [];

async function register(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  db.push({ username, hashedPassword });
  console.log("register", username, hashedPassword);
  return true;
}

async function login(username, password) {
  const DBUser = await db.find((u) => u.username === username);
  const isCorrectPassword = await bcrypt.compare(
    password,
    DBUser.hashedPassword
  );
  console.log("logged in", isCorrectPassword);
  return true;
}
async function registerThenLogin() {
  await register("Mamuna", "Mash123");
  await login("Mamuna", "Mash123");
}
registerThenLogin();
