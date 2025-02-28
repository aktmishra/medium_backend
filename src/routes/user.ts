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
    return c.json({ message: "Incorrect Input.", success: false });
  }
  const existingUser = await prisma.user.findFirst({
    where: { email: body.email },
  });
  if (existingUser) {
    c.status(406);
    return c.json({
      message: "User already registered with this Email .",
      success: false,
    });
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    if (!user) {
      c.status(400);
      return c.json({ Message: "Something went wrong", success: false });
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    c.status(200);
    return c.json({
      message: "User Registered Sucsessfuly",
      success: true,
      data: token,
    });
  } catch (error) {
    c.status(500);
    return c.json({ message: "Internal server error", success: false });
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
    return c.json({ message: "Incorrect Input.", success: false });
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
      return c.json({ Message: "User Not Found", success: false });
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    c.status(200);
    return c.json({
      message: "Logged In Sucsessfuly",
      success: true,
      data: token,
    });
  } catch (error) {
    c.status(500);
    return c.json({ message: "Internal server error", success: false });
  }
});

export default userRouter;
