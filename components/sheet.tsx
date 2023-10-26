import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

export type sheetProps = {
  header: React.ReactNode;
  button: React.ReactNode;
  closeFunc?: React.ReactNode;
  children: React.ReactNode;
};

const SheetComp: React.FC<sheetProps> = ({
  header,
  closeFunc,
  button,
  children,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{button}</SheetTrigger>
      <SheetContent>
        {header}
        {children}
        <SheetFooter>
          {closeFunc && <SheetClose asChild>{closeFunc}</SheetClose>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SheetComp;
