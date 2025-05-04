"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema } from "@/schemas/index";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import { forgotPassword } from "@/actions/forgot-password";
import { JSX, useState, useTransition } from "react";

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordForm = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues): void => {
    setError("");
    setSuccess("");

    startTransition(() => {
      forgotPassword(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
        }
      });
    });
  };

  return (
    
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-[500px]">
      
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    disabled={isPending}
                    placeholder="your email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormError message={error} />
          <FormSuccess message={success} />

          <Button
            variant="default"
            size="lg"
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            send reset link
          </Button>
        </form>
      </Form>
  );
};

export default ForgotPasswordForm;
