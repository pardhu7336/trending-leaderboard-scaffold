
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

/**
 * Record one unit of engagement for a post.
 */
export async function upvote(postId) {
  return redis.zincrby("trending:posts", 1, postId);
}

/**
 * Fetch top N posts with metadata using a pipeline.
 */
export async function getTop(n) {
  // Get ranked post IDs and scores
  const flat = await redis.zrevrange(
    "trending:posts",
    0,
    n - 1,
    "WITHSCORES"
  );

  const rows = [];
  const pipeline = redis.pipeline();

  // Queue metadata requests
  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];

    rows.push({
      id,
      score: Number(flat[i + 1])
    });

    pipeline.hgetall(id + ":meta");
  }

  // Execute all metadata requests together
  const results = await pipeline.exec();

  // Combine ranking and metadata
  return rows.map((row, k) => ({
    ...row,
    ...results[k][1]
  }));
}

export { redis };
