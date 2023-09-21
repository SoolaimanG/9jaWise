export type varientTypes = "error" | "warning";

type chipProps = {
  varient: "default" | varientTypes | "success";
  text: string;
  icon?: React.ReactElement;
  className?: string;
};

const Chip = (props: chipProps) => {
  const { varient, text, icon, className } = props;

  const colors = {
    default: "bg-purple-200 text-purple-600",
    error: "bg-red-200 text-red-600",
    warning: "bg-yellow-100 text-yellow-600",
    success: "bg-green-100 text-green-600",
  };

  return (
    <div
      className={`${className} px-2 py-[2px] rounded-md cursor-pointer flex items-center gap-1 ${colors[varient]}`}
    >
      {typeof icon !== "string" && typeof icon !== "undefined" && (
        <span>{icon}</span>
      )}
      {text}
    </div>
  );
};

export default Chip;
