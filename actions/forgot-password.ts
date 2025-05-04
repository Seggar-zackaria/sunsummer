'use server';

import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { ForgotPasswordSchema } from "@/schemas/index";
import {sendPasswordResetEmail} from "@/app/api/send/route";
import { generatePasswordResetToken } from "@/lib/tokens";


export const forgotPassword = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);
    if(!existingUser){
        return {error: "Email not found"}
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);


    return {success: "Email sent"}
}
    
