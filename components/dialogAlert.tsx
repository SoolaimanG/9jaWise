import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type dialogProps = {
  title?: string;
  description?: string;
  button: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
};

export function DialogAlert({
  title,
  description,
  button,
  content,
  footer,
  open,
}: dialogProps) {
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent className="w-[35rem] md:w-[90%] sm:w-[90%]">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
