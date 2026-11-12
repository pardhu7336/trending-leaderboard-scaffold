
import { redis } from "./leaderboard.js";

async function seed() {
  await redis.del("trending:posts");

  const pipeline = redis.pipeline();

  for (let i = 1; i <= 100; i++) {
    const id = "post:" + i;

    // Store post metadata
    pipeline.hset(
      id + ":meta",
      "title",
      "Post number " + i,
      "author",
      "@user" + i
    );

    // Store post ranking with a random score (0–49)
    const score = Math.floor(Math.random() * 50);

    pipeline.zadd("trending:posts", score, id);
  }

  // Execute all 200 commands together
  await pipeline.exec();

  console.log("Seeded 100 posts.");

  redis.disconnect();
}

seed();
