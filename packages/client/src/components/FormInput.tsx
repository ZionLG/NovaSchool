import type {
  Control,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Password } from "./ui/password";

type ExtendedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
};
type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
} & Pick<ControllerProps<TFieldValues, TName>, "disabled" | "rules"> &
  ExtendedInputProps & {
    placeholder?: string;
    label: string;
    showError?: boolean;
    required?: boolean;
    description?: string;
  };

const FormInput = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  placeholder,
  required,
  control,
  label,
  description,
  type,
  disabled,
  showError = true,
  rules,
}: FormInputProps<TFieldValues, TName>) => {
  return (
    <div>
      <FormField
        rules={rules}
        control={control}
        name={name}
        render={({ field }) => {
          let inputElement: JSX.Element;
          switch (type) {
            case "password":
              inputElement = (
                <Password
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                />
              );
              break;
            default:
              inputElement = (
                <Input
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                  type={type}
                  onChange={(e) => {
                    if (type === "number") {
                      field.onChange(e.target.valueAsNumber);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              );
          }

          return (
            <FormItem
              className={`${type === "switch" && `flex  items-center justify-between rounded-lg border p-3 shadow-sm`} ${type === "checkbox" && `flex  items-center  gap-3 space-y-0 rounded-md border p-4 `} text-start`}
            >
              <FormLabel className="flex gap-1 leading-5">
                <span>{label}</span>
                {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>{inputElement}</FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              {showError && <FormMessage />}
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default FormInput;
