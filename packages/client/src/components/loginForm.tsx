import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "../components/ui/form";
import { cn } from "../../@/lib/utils";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Dot } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import FormInput from "./FormInput";
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
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const detailsForm = useForm<z.infer<typeof loginFormSchema>>({
      resolver: zodResolver(loginFormSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    }),
    { control, handleSubmit } = detailsForm;
  const onSubmitDetails = handleSubmit(
    async (data: z.infer<typeof loginFormSchema>) => {
      setIsLoading(true);
      const toastId = toast("Sonner");
      toast.loading("Loading...", {
        id: toastId,
      });

      const result = await supabase.auth
        .signInWithPassword({
          email: data.email,
          password: data.password,
        })
        .finally(() => {
          setIsLoading(false);
        });
      if (result.error) {
        toast.error(`${result.error.message}`, {
          id: toastId,
        });
      } else {
        toast.success(`Signed in as ${result.data.user.email}`, {
          id: toastId,
        });
      }
    }
  );
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...detailsForm}>
        <form onSubmit={onSubmitDetails} className="grid gap-2">
          <FormInput name="email" label={"Email"} control={control} />
          <FormInput
            name="password"
            label={"Password"}
            control={control}
            type="password"
          />
          <Dot className="my-2 place-self-center" />

          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
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
