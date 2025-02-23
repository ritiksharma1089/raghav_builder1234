import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signInInput, signUpInput } from "../zod";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";

export const userRouter = new Hono<{
	Bindings:{
		DATABASE_URL : string;
		JWT_SECRET:string
	}
}>();


userRouter.post('/signup',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    
    const body = await c.req.json()
    const valid = signUpInput.safeParse(body);


    if(!valid.success){
        return c.json("zod invalid");
    }


    try{
        const user = await prisma.user.create({
            data:{
                email:body.email,
                name:body.name,
                password:body.password
            }
        })

        // return c.json("done");
        console.log(c.env.JWT_SECRET)

        const jwt = await sign({id:user.id},c.env.JWT_SECRET);
        

        return c.text(jwt)
    }
    catch(err){

        return c.json({error:err});
    }
    
})

userRouter.post('/signin', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    
    const body = await c.req.json()
    const valid = signInInput.safeParse(body)

    

    if(!valid.success){
        return c.status(403);
    }

    console.log(body.username, "this is email we get")

    try{
        const user = await prisma.user.findFirst({
            where:{
                email:body.username
            }
        });
        console.log(user)

        if(!user){
            return c.json({error:"data not found"})
        }

        if(user?.password ===body.password){
            const jwt = await sign({id:user?.id},c.env.JWT_SECRET);

            return c.json({sucess:true, token:jwt})
        }
        else{

            return c.json({error:"invalid inputs"})
        }
    
        

    }
    catch(err){

        return c.json("some problem with your details",403);
    }
})



