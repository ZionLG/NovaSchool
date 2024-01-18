import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { cn } from "../../@/lib/utils";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dot } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
export const registerFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must be at max 30 characters.",
    }),
  email: z.string().email({
    message: "Must be a valid Email Address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});
type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};
interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const RegisterForm = ({ className, ...props }: UserAuthFormProps) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const supabase = useSupabaseClient();

  const detailsForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const onSubmitDetails = detailsForm.handleSubmit(
    async (data: z.infer<typeof registerFormSchema>) => {
      setIsLoading(true);
      const toastId = toast("Sonner");
      toast.loading("Loading...", {
        id: toastId,
      });

      const result = await supabase.auth
        .signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
            },
          },
        })
        .finally(() => {
          setIsLoading(false);
        });
      if (result.error) {
        toast.error(`${result.error.message}`, {
          id: toastId,
        });
      } else {
        toast.success(
          `Confirm your email ${result.data.user?.email} to log in.`,
          {
            id: toastId,
          }
        );
      }
    }
  );
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...detailsForm}>
        <form onSubmit={onSubmitDetails} className="grid gap-2">
          <FormField
            control={detailsForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Username</FormLabel>
                <FormControl>
                  <Input {...field} className="text-lg" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={detailsForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Email</FormLabel>
                <FormControl>
                  <Input {...field} className="text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={detailsForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Password</FormLabel>
                <FormControl>
                  <Input {...field} className="text-lg" type="password" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Dot className="my-2 place-self-center" />

          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign Up
          </Button>
          {detailsForm.formState.errors.root && (
            <span className="ml-2 text-destructive">
              {detailsForm.formState.errors.root.message ?? ""}
            </span>
          )}
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
