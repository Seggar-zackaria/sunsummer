"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "@/schemas/index";
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
import { resetPassword } from "@/actions/reset-password";
import { JSX, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

const ResetPasswordForm = (): JSX.Element => {
  const params = useSearchParams();
  const token = params.get("token");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");


  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: ResetPasswordFormValues): void => {
    setError("");
    setSuccess("");

    startTransition(() => {
      resetPassword(values, token).then((data) => {
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    disabled={isPending}
                    placeholder="your new password"
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
            Reset Password
          </Button>
        </form>
      </Form>
  );
};

export default ResetPasswordForm;
