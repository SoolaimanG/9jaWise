import { Progress } from "./ui/progress";

export type ProgressCompProps = {
  value: number;
  max?: number;
};

const ProgressComp = (props: ProgressCompProps) => {
  const { value, max } = props;

  return (
    <div className="w-full">
      <Progress value={max ? max - (max - value) : value} />
    </div>
  );
};

export default ProgressComp;
