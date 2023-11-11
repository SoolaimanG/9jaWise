//--------------------->All Imports<--------------------
import { security_settings } from "@/app/api/settings/security/route";
import SlideFromBelow from "@/components/Animations/slideFromBelow";
import Button from "@/components/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/provider";
import React, { useEffect, useState } from "react";

const Security = () => {
  const { user, try_refresh } = useStore();
  const [loading, setLoading] = useState(false);

  //--------------------->States for security settings<---------------
  const [hide_balance, setHide_Balance] = useState<boolean>();
  const [withdraw_with_auth, setwithdraw_with_auth] = useState<boolean>();
  const [white_list_ip, setwhite_list_ip] = useState<boolean>();
  const [disable_trf, setdisable_trf] = useState<boolean>();
  const [two_factor_auth, settwo_factor_auth] = useState<boolean>();
  const [switch_auth, setSwitch_auth] = useState<boolean>();

  //--->Set the ui to data from DB on component mount<----
  useEffect(() => {
    if (!user) return;

    const {
      settings: {
        send_otp_for_each_transaction,
        disableTransfer,
        twoFactorAuthentication,
        hidebalance,
        whitelist_ip,
      },
    } = user;

    setHide_Balance(hidebalance);
    setwithdraw_with_auth(send_otp_for_each_transaction);
    setwhite_list_ip(whitelist_ip);
    setdisable_trf(disableTransfer);
    settwo_factor_auth(twoFactorAuthentication);
  }, [user]);

  //Using this to send request request to the API to update the user settings
  const send_request = async () => {
    //setHide_Balance

    //PAYLOAD Types is :security_settings
    const payload: security_settings = {
      hide_balance: hide_balance as boolean,
      ask_for_auth: withdraw_with_auth as boolean,
      whitelist_ip: white_list_ip as boolean,
      disable_transfer: disable_trf as boolean,
      two_factor_auth: two_factor_auth as boolean,
      switch_auth: switch_auth as boolean,
    };

    setLoading(true);
    const res = await fetch("/api/settings/security", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    //If the request is bad notify the user that the update is incomplete
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    //In the other cases if the update is successful notify the user
    setLoading(false);
    toast({
      title: `SUCCESS`,
      description: res.statusText,
    });
    try_refresh(); //Try fetching updated data
  };

  return (
    <SlideFromBelow className="w-full flex flex-col gap-3">
      <div className="">
        <p className="text-xl">Security Features</p>
        <span className="text-gray-400">
          Enable and disable to your prefrences
        </span>
      </div>
      <hr />
      <div className="flex flex-col gap-3">
        <div className="w-full flex items-end justify-end">
          <Button
            name="Save changes"
            disabled={loading}
            states={loading ? "loading" : undefined}
            onClick={send_request}
            varient="filled"
            className="px-4 py-1"
            borderRadius
          />
        </div>
        <div className="flex mt-5 items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">Hide Balance</p>
            <span className="text-gray-400">
              Enable and disable to your prefrences
            </span>
          </div>
          <Switch
            checked={hide_balance}
            onCheckedChange={() => {
              setHide_Balance((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">Withdraw with Auth</p>
            <span className="text-gray-400">
              Ask for Password or OTP for each transaction
            </span>
          </div>
          <Switch
            checked={withdraw_with_auth}
            onCheckedChange={() => {
              setwithdraw_with_auth((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
        <div className=" flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">White-List IP address</p>
            <span className="text-gray-400">Login with this device and IP</span>
          </div>
          <Switch
            checked={white_list_ip}
            onCheckedChange={() => {
              setwhite_list_ip((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
        <div className=" flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">Disable Transfer</p>
            <span className="text-gray-400">
              When this is turn on transfer wont process
            </span>
          </div>
          <Switch
            checked={disable_trf}
            onCheckedChange={() => {
              setdisable_trf((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
        <div className=" flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">2FA</p>
            <span className="text-gray-400">Two Factor Authentication</span>
          </div>
          <Switch
            checked={two_factor_auth}
            onCheckedChange={() => {
              settwo_factor_auth((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
        <div className=" flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-lg">Switch login mode</p>
            <span className="text-gray-400">
              If you are using email to login switch to phone number
            </span>
          </div>
          <Switch
            checked={switch_auth}
            onCheckedChange={() => {
              setSwitch_auth((prev) => !prev);
            }}
            disabled={loading}
          />
        </div>
      </div>
    </SlideFromBelow>
  );
};

export default Security;
