import { PrismaClient } from "@prisma/client/edge.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// signup 
userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  // Validate input
  if (!body.email || !body.password) {
    c.status(400);
    return c.json({ message: "Email and password are required." });
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    if (!user) {
      c.status(400);
      return c.json({ Message: "Something went wrong" });
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({message: "User Registered Sucsessfuly", token });
  } catch (error) {
    c.status(403);
    return c.json({ message: error });
  }
});

// signin
userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  // Validate input
  if (!body.email || !body.password) {
    c.status(400);
    return c.json({ message: "Email and password are required." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      }
    });
    if (!user) {
      c.status(400);
      return c.json({ Message: "User Not Found" });
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ message: "Logged In Sucsessfuly", token });
  } catch (error) {
    c.status(403);
    return c.json({ message: error });
  }
});



export default userRouter;
