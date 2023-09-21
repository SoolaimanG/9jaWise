import { Progress } from "./ui/progress";

export type ProgressCompProps = {
  value: number;
  showIndicator?: boolean;
  startFrom?: number;
  end?: number;
};

const ProgressComp = (props: ProgressCompProps) => {
  const { value, showIndicator, startFrom, end } = props;

  const calculateProgress = (value: number) => {
    if (showIndicator && startFrom !== undefined && end !== undefined) {
      const totalRange = end - startFrom;
      const progress = (value - startFrom) / totalRange;
      return progress * 100;
    } else {
      return value;
    }
  };

  return (
    <div className="w-full">
      <Progress value={calculateProgress(value)} />
      {showIndicator && (
        <div className="w-full flex items-center justify-between">
          <span className="dark:text-gray-200 text-slate-700">{startFrom}</span>
          <span className="dark:text-gray-200 text-slate-700">{end}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressComp;
