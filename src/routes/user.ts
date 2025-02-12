import { PrismaClient } from "@prisma/client/edge.js";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@aktmishra/medium_common";

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
//   const { user } = signupInput.safeParse(body);
  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Incorrect Input." });
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
    return c.json({ message: "User Registered Sucsessfuly", token });
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
  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: "Incorrect Input." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
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
