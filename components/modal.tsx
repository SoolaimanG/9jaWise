import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type modalProps = {
  button: React.ReactNode;
  content: React.ReactNode;
  actionBtn?: string;
  open?: boolean;
  action?: () => void;
};

export function Modal(props: modalProps) {
  const { button, content, actionBtn, open, action } = props;

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        {content}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          {actionBtn && (
            <AlertDialogAction
              onClick={() =>
                //@ts-ignore
                action()
              }
            >
              {actionBtn}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
