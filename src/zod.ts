import z from "zod"

export const signUpInput = z.object({
    email:z.string().email(),
    password:z.string().min(6),
    name:z.string()
});


export const signInInput = z.object({
    username:z.string().email(),
    password:z.string().min(6),
    
});

export const newProduct = z.object({
    title:z.string(),
    price :z.string(),
    
    content :z.string(),
    image :z.string(),
    size :z.string()
   
})