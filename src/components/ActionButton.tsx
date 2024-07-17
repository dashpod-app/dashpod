import { Cog } from "lucide-react";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

export default function ActionButton({
  onClick,
  isLoading,
  isSuccess,
  className,
  children,
  ...props
}: {
  onClick: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button onClick={onClick} className={className} {...props}>
      {children}
      {isLoading && <Cog size={16} className="animate animate-spin" />}
      {!isLoading && isSuccess && <Check />}
    </Button>
  );
}
