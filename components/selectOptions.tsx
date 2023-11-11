//-------------------------->All Imports<-------------------------------
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//Select Props Some are option while some are required
type selectOptionType = {
  label: string;
  title?: string;
  items: { name: "all" | "credit" | "debit" }[]; //Items i want to show
  className?: string;
  action: (props: "all" | "credit" | "debit") => void; //Since this is only use here a hard coded value are passed
};

export function SelectOption({
  //Destructing properties ........
  label,
  title,
  items,
  className,
  action,
}: selectOptionType) {
  return (
    <Select onValueChange={(e: "all" | "credit" | "debit") => action(e)}>
      <SelectTrigger className={className}>
        <SelectValue
          //Tailwinf Capitalize does not work here thats why JS is use to capitalize the Items
          placeholder={label[0].toUpperCase() + label.substring(1)}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {title && <SelectLabel>{title}</SelectLabel>}
          {items.map((_, i) => (
            <SelectItem defaultValue={"all"} key={i} value={_.name}>
              {_.name[0].toUpperCase() + _.name.substring(1)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
