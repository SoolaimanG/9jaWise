import { Progress } from "./ui/progress";

export type ProgressCompProps = {
  value: number;
  max?: number;
  className?: string;
};

const ProgressComp = (props: ProgressCompProps) => {
  const { value, max, className } = props;

  return (
    <div className={`w-full ${className}`}>
      <Progress value={max ? (value / max) * 100 : value} />
    </div>
  );
};

export default ProgressComp;
