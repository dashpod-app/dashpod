import { Cog, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

type ActionButtonVariant = "primary" | "secondary";

const variants = {
  primary: <Cog size={16} className="animate animate-spin ml-0.5" />,
  secondary: <Loader size={16} className="animate animate-spin ml-0.5" />,
};

export default function ActionButton({
  onClick,
  isLoading,
  isSuccess,
  className,
  loaderVariant = "primary",
  children,
  ...props
}: {
  onClick: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  className?: string;
  loaderVariant?: ActionButtonVariant;
  children: React.ReactNode;
}) {
  return (
    <Button onClick={onClick} className={className} {...props}>
      {children}
      {isLoading && variants[loaderVariant]}
      {!isLoading && isSuccess && <Check />}
    </Button>
  );
}
