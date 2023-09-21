import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles

export type passwordStrength = 0 | 20 | 40 | 60 | 80 | 100;

type progressBarProps = {
  width: "10px" | "20px" | "30px" | "40px" | "50px" | "60px";
  value: passwordStrength;
};

const ProgressBars = (props: progressBarProps) => {
  const { width, value } = props;

  const maxValue = 100;

  return (
    <div style={{ width: width }}>
      <CircularProgressbar
        value={value}
        maxValue={maxValue}
        text={`${value}`}
        styles={buildStyles({
          textSize: "45px",
        })}
      />
    </div>
  );
};

export default ProgressBars;
