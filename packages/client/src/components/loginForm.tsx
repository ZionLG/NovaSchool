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

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dot } from "lucide-react";
export const loginFormSchema = z.object({
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

  const detailsForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmitDetails = detailsForm.handleSubmit(
    (values: z.infer<typeof loginFormSchema>) => {
      console.log(values);
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  );
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...detailsForm}>
        <form onSubmit={onSubmitDetails} className="grid gap-2">
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
