import { usePathname } from "next/navigation";

export const useGetId = (position: number) => {
  const id: string = usePathname().split("/")[position];

  return id;
};
