import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export type modalProps = {
  button: React.ReactNode;
  content: React.ReactNode;
};

export function Modal(props: modalProps) {
  const { button, content } = props;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      {content}
    </AlertDialog>
  );
}
