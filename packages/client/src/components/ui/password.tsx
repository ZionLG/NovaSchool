import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import type { InputProps } from "./input";
import { Input } from "./input";

export type PasswordProps = InputProps & {
  className?: string;
};

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    return (
      <div className="relative">
        <Input type={showPassword ? "text" : "password"} ref={ref} {...props} />
        <div
          className={`absolute inset-y-0  flex cursor-pointer items-center  text-gray-400 right-0 pr-3`}
        >
          {showPassword ? (
            <EyeOff className="h-6 w-6" onClick={togglePasswordVisibility} />
          ) : (
            <Eye className="h-6 w-6" onClick={togglePasswordVisibility} />
          )}
        </div>
      </div>
    );
  }
);

Password.displayName = "Input";

export { Password };
