import React, { useEffect, useState } from "react";
import { DialogAlert } from "../dialogAlert";
import Button from "../button";
import { AiOutlinePlus } from "react-icons/ai";
import Input from "../input";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { icons } from "../data";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { savingProps, useStore } from "@/provider";
import { v4 as uuidv4 } from "uuid";
import EmptyState from "./emptyState";
import { DialogClose } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Modal } from "../modal";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { beneficiariesProps, userProps } from "@/Models/user";
import { toast } from "../ui/use-toast";

const Saving = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [showDate, setShowDate] = useState(false);
  const [allow_withdraw, setAllow_withdraw] = useState(true);
  const [icon_name, setIcon_name] = useState("");
  const [goal_name, setGoal_name] = useState<string | number>("");
  const [desc, setdesc] = useState<string | number>("");
  const [amount, setAmount] = useState<string | number>("");
  const [from_bucket, setFrom_bucket] = useState<string | number>("");
  const [withdraw_amount, setWithdraw_amount] = useState<string | number>("");
  const [withdraw_with_password, setWithdraw_with_password] = useState(false);
  const [password, setPassword] = useState<string | number>("");

  const [states, setStates] = useState({
    loading: false,
    error: false,
    success: false,
    message: "",
  });

  const { user, try_refresh } = useStore();

  const { savings } = user as userProps<beneficiariesProps>;
  const current_time = Date.now();

  const total_amount = savings.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0);

  const naira = useNairaFormatter(total_amount);

  const addSaves = async () => {
    setStates({ ...states, loading: true });

    const payload: savingProps = {
      _id: String(Date.now()),
      icon_name: icon_name,
      amount: Number(amount),
      date: new Date(),
      allow_withdraw: !allow_withdraw,
      name: goal_name as string,
      description: desc as string,
      withdraw_with_password: withdraw_with_password,
    };

    const res = await fetch("/api/savings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    //Clear Form
    setIcon_name("");
    setAmount("");
    setGoal_name("");
    setdesc("");
    setDate(undefined);

    if (!res.ok) {
      //Delay Close Modal
      setStates({ ...states, loading: false });
      return toast({
        variant: "destructive",
        title: `ERROR ${res.status}`,
        description: res.statusText,
      });
    }

    try_refresh();
    setStates({ ...states, loading: false });
    toast({
      title: `SUCCESS`,
      description: res.statusText,
    });
  };

  const delete_savings = async (id: string) => {
    const find_saving = savings.find((save) => {
      return save._id === id;
    });

    if (!find_saving) {
      return;
    }

    const withdrawal_time = new Date(find_saving?.date);

    if (
      !find_saving.allow_withdraw &&
      withdrawal_time.getTime() > current_time
    ) {
      return toast({
        title: "ERROR",
        description: `Please wait till ${find_saving.date} before withdrawing/deletings`,
        variant: "destructive",
      });
    }

    const payload = {
      id: id,
      password: password,
      otp: password,
    };

    const res = await fetch(`/api/savings`, {
      method: "DELETE",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast({
        title: "ERROR" + " " + String(res.status),
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    try_refresh();
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
  };

  const withdraw_savings = async () => {
    const find_saving = savings.find((save) => {
      return save.name.toLowerCase() === from_bucket.toString().toLowerCase();
    });

    if (!find_saving) {
      return;
    }

    const withdrawal_time = new Date(find_saving.date);

    if (
      !find_saving.allow_withdraw &&
      withdrawal_time.getTime() > current_time
    ) {
      return toast({
        title: "ERROR",
        description: `Please wait till ${find_saving.date} before withdrawing/deletings`,
        variant: "destructive",
      });
    }

    if (Number(withdraw_amount) > find_saving.amount) {
      return toast({
        title: "ERROR",
        description: `Cannot withdraw unavailable amount`,
        variant: "destructive",
      });
    }

    setStates({ ...states, loading: true });

    const payload = {
      name: from_bucket.toString().trim().toLowerCase(),
      amount: withdraw_amount,
      password: withdraw_with_password,
    };

    const res = await fetch("/api/savings/withdraw", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStates({ ...states, loading: false });
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });

      return;
    }

    setStates({ ...states, loading: false });
    toast({
      title: `SUCCESS`,
      description: res.statusText,
    });
    try_refresh();
  };

  //List of icons to select
  const selectIcons = (
    <div className="w-full flex flex-wrap items-center gap-2">
      {icons.map((icon) => (
        <span
          onClick={() => setIcon_name(icon.name)}
          className={`p-3 ${
            icon.name === icon_name && "bg-purple-700 text-white"
          } hover:-translate-y-2 cursor-pointer transition-all delay-75 ease-linear hover:bg-purple-700 hover:text-white rounded-md bg-purple-300 text-purple-600 text-xl`}
          key={icon.name}
        >
          {icon.icon}
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3 relative">
      <div className="w-full flex items-end justify-end">
        <DialogAlert
          button={
            <Button
              icon={<AiOutlinePlus size={20} />}
              className="px-3 py-1 top-0 right-0 rounded-md"
              name="Add to savings"
              varient="filled"
              disabled={false}
              onClick={() => {}}
            />
          }
          title="Saving Goal"
          description="Set your saving goal"
          content={
            <div className="w-full h-[25rem] md:h-[30rem] sm:h-[30rem] overflow-auto flex flex-col gap-3">
              <Input
                value={goal_name}
                setValue={setGoal_name}
                placeholder="Goal Name (Buy Car-1)"
                type="text"
              />
              <Input
                type="text"
                value={desc}
                setValue={setdesc}
                placeholder="Description your saving goal (OPTIONAL)"
              />
              <Input
                value={amount}
                placeholder="Amount to save from your balance"
                setValue={setAmount}
                type="text"
              />
              <div className="w-full flex p-4 border border-gray-300 rounded-md items-center justify-between">
                <div>
                  <p className="text-lg text-gray-400 font-semibold">
                    Prevent withdrawal
                  </p>
                  <span>Prevent yourself from withdrawing your saving</span>
                </div>
                <Switch
                  checked={allow_withdraw}
                  onCheckedChange={() => setAllow_withdraw((prev) => !prev)}
                />
              </div>
              {allow_withdraw && (
                <div>
                  <button
                    onClick={() => setShowDate(!showDate)}
                    className="w-full px-2 h-[2.5rem] border border-gray-300 hover:bg-gray-200 flex items-center hover:dark:bg-slate-800 rounded-md gap-2 justify-start"
                  >
                    <CalendarIcon size={20} />
                    {date
                      ? format(date, "PPP")
                      : "Pick a date to allow withdraw"}
                  </button>
                  {showDate && (
                    <div className="absolute dark:bg-slate-900 bg-gray-100 top-0 left-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="w-full flex p-4 border border-gray-300 rounded-md items-center justify-between">
                <div>
                  <p className="text-lg text-gray-400 font-semibold">
                    Use Password
                  </p>
                  <span>
                    Whenever you want to withdraw ask for OTP or password first?
                  </span>
                </div>
                <Switch
                  checked={withdraw_with_password}
                  onCheckedChange={() =>
                    setWithdraw_with_password((prev) => !prev)
                  }
                />
              </div>
              <p className="text-xl text-purple-400">
                Select preferred icon to use
              </p>
              {selectIcons}
              <div className="w-full flex items-end justify-end">
                <Button
                  icon={<AiOutlinePlus size={20} />}
                  className="h-[2.5rem] px-5 top-0 right-0 rounded-md"
                  name="Create"
                  states={states.loading ? "loading" : undefined}
                  varient="warning"
                  disabled={
                    goal_name &&
                    amount &&
                    (allow_withdraw ? (date ? true : false) : true) &&
                    icon_name
                      ? false
                      : true
                  }
                  onClick={addSaves}
                />
              </div>
            </div>
          }
        />
      </div>
      <div className="w-full">
        <div className="flex w-full flex-col gap-2">
          <p className="">Total Money Saved:</p>
          <strong className="text-4xl wordGradient">{naira}</strong>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xl">My Bucket(s)</p>
        {savings.length <= 0 ? (
          <EmptyState message="No save bucket created" />
        ) : (
          <div className="w-full mt-3 grid grid-cols-3 gap-2 md:grid-cols-2 sm:grid-cols-2 ">
            {savings.map((saves, i) => {
              const n = useNairaFormatter(saves.amount);
              const icon = icons.filter((i) => {
                return i.name === saves.icon_name;
              });
              return (
                <div
                  className={`w-full p-2 cursor-pointer flex flex-col gap-2 rounded-md ${
                    i % 2 === 0 ? "bg-purple-500" : "bg-yellow-200"
                  }`}
                  key={saves._id.toString()}
                >
                  <div className="w-full flex justify-between">
                    <span
                      className={`p-2 ${
                        i % 2 === 0 ? "text-purple-700" : "text-yellow-500"
                      } rounded-full ${
                        i % 2 === 0 ? "bg-purple-300" : "bg-yellow-100"
                      }`}
                    >
                      {icon[0].icon}
                    </span>
                    <Modal
                      button={<BsThreeDotsVertical size={20} />}
                      actionBtn={"Delete"}
                      action={() => delete_savings(saves._id.toString())}
                      content={
                        <div className="w-full">
                          <DialogTitle>Do you want to delete this?</DialogTitle>
                          <DialogDescription>
                            This action is irrevesible (cannot be undone)
                          </DialogDescription>
                        </div>
                      }
                    />
                  </div>
                  <div
                    className={`w-full ${
                      i % 2 === 0 ? "text-white" : "text-yellow-700"
                    } `}
                  >
                    <p className="text-2xl font-semibold">{n}</p>
                    <span
                      className={`${
                        i % 2 === 0 ? "text-gray-100" : " text-yellow-900"
                      } `}
                    >
                      {saves.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {savings.length >= 1 && (
        <div className="w-full flex flex-col gap-2">
          <Input
            value={withdraw_amount}
            placeholder="Amount to withdraw"
            setValue={setWithdraw_amount}
            type="text"
          />
          <Input
            value={from_bucket}
            placeholder="Bucket to withdraw from"
            setValue={setFrom_bucket}
            type="text"
          />
          <div className="flex items-center gap-2">
            <Input
              value={password}
              placeholder="Add Password or OTP (OPTIOANAL)"
              setValue={setPassword}
              type="text"
            />
            <Button
              className="w-[30%] h-[2.5rem]"
              borderRadius={true}
              disabled={false}
              name="Request OTP"
              onClick={() => {}}
              varient="filled"
            />
          </div>
          <Button
            className="w-full md:w-full sm:w-full h-[2.5rem]"
            borderRadius={true}
            disabled={states.loading}
            name="Withdraw"
            states={states.loading ? "loading" : undefined}
            onClick={withdraw_savings}
            varient="danger"
          />
        </div>
      )}
    </div>
  );
};

export default Saving;
