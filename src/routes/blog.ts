import { PrismaClient } from "@prisma/client/edge.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: number;
  };
}>();

// varify jwt
postRouter.use("/*",async (c, next) => {
  const token = c.req.header("Authorization");
  if (!token) {
    c.status(403);
    return c.json({ Message: "Unauthorized" });
  }
  //   const token = token.split(" ")[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET); // Verify the token
    c.set("userId", Number(payload.id)); // Store user ID in context
    await next(); // Proceed to the next middleware or route handler
  } catch (error) {
    c.status(400);
    return c.json({ message: "Unauthorized" });
  }
});

// create post
postRouter.post("/create", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const authorId = c.get("userId");
  const body = await c.req.json();
  if (!body.title || !body.content) {
    c.status(400);
    return c.json({ Message: "Missing required fields:title, or content" });
  }
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      },
    });
    if (!post) {
      c.status(403);
      return c.json({ Message: "Something went wrong while creating post" });
    }

    c.status(200);
    return c.json({
      message: "Post Created Successfuly",
    });
  } catch (error) {
    c.status(500);
    return c.json({ Message: "Something went wrong" });
  }
});

// update post
postRouter.put("/update", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  try {
    const post = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    if (!post) {
      c.status(403);
      return c.json({ Message: "Something went wrong while updating" });
    }

    c.status(200);
    return c.json({
      message: "Post Updated Successfuly",
      data: post,
    });
  } catch (error) {
    c.status(500);
    return c.json({ Message: "Something went wrong" });
  }
});

// all post
postRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  // filter : pagination
  try {
    const post = await prisma.post.findMany();
    if (!post) {
      c.status(403);
      return c.json({ Message: "Something went wrong while fetching post" });
    }
    c.status(200);
    return c.json({
      message: "Post Fetched Successfuly",
      data: post,
    });
  } catch (error) {
    c.status(500);
    return c.json({ Message: "Something went wrong" });
  }
});

//  get single post
postRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = Number(c.req.param("id"));
  try {
    const post = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });
    if (!post) {
      c.status(403);
      return c.json({ Message: "Something went wrong while fetching post" });
    }
    c.status(200);
    return c.json({
      message: "Post Fetched Successfuly",
      data: post,
    });
  } catch (error) {
    c.status(500);
    return c.json({ Message: "Something went wrong" });
  }
});

export default postRouter;
