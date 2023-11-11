//------------------->All Imports<---------------

import SlideFromBelow from "@/components/Animations/slideFromBelow";
import Button from "@/components/button";
import DarkMode from "@/components/darkMode";
import Input from "@/components/input";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/provider";
import React, { useEffect, useState } from "react";

const Personal = () => {
  const { user, try_refresh } = useStore();

  //----------------->Personal Details States<------------------
  const [username, setUsername] = useState<string | number>("");
  const [phoneNumber, setPhoneNumber] = useState<string | number>("");
  const [email, setEmail] = useState<string | number>("");
  const [nationality, setNationality] = useState<string | number>("");
  const [state, setState] = useState<string | number>("");
  const [place_of_birth, setPlace_of_birth] = useState<string | number>("");
  const [occupation, setOccupation] = useState<string | number>("");
  const [next_of_kin, setnext_of_kin] = useState<string | number>("");
  const [nok_name, setNok_name] = useState<string | number>("");

  const [loading, setLoading] = useState(false); //For Loading

  //-------------------------->Password States<------------------------
  const [old_password, setOld_password] = useState<string | number>("");
  const [confirm_password, setConfirm_Password] = useState<string | number>("");
  const [password, setPassword] = useState<string | number>("");

  //----------->Function to change password and save changes<---------------
  const save_changes = async () => {
    setLoading(true);

    const payload = {
      username: username,
      phoneNumber: phoneNumber,
      user_email: email,
      nationality: nationality,
      next_of_kin: next_of_kin,
      nok_name: nok_name,
      state: state,
      occupation: occupation,
      place_of_birth: place_of_birth,
    };

    const res = await fetch("/api/settings/personal", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    setLoading(false);
    try_refresh(); //Hard refresh to get updates data from the database
  };
  const change_password = async () => {
    setLoading(true);

    //Payload needed to change password to new one
    const payload = {
      password: password,
      confirm_password: confirm_password,
      previous_password: old_password,
    };

    const res = await fetch("/api/settings/update_password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({
      title: `SUCCESS`,
      description: res.statusText,
    });
    try_refresh(); //Hard refresh to get new data
  };

  //Distribute the input on user change
  useEffect(() => {
    if (!user) return;

    const {
      username,
      email,
      phoneNumber,
      KYC: {
        address: { nationality, place_of_birth, state },
        nextOfKin: { name, nok },
      },
      occupation,
    } = user;

    setUsername(username);
    setPhoneNumber(phoneNumber as string);
    setEmail(email as string);
    setNationality(nationality as string);
    setPlace_of_birth(place_of_birth as string);
    setnext_of_kin(nok);
    setNok_name(name);
    setOccupation(occupation);
    setState(state as string);
  }, [user]);

  return (
    <SlideFromBelow className="w-full flex flex-col gap-3">
      <div className="w-full flex gap-2 items-end justify-end">
        <DarkMode color="p" position="h" hide_name />
        <Button
          varient="filled"
          borderRadius
          className="px-5 py-[3px]"
          name="Save"
          states={loading ? "loading" : undefined}
          disabled={loading}
          onClick={save_changes}
        />
      </div>
      <div className="">
        <p className="text-xl">Personal Information</p>
        <span className="text-gray-400">
          Edit your profile to your prefrence.
        </span>
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-2 md:flex-col sm:flex-col items-center">
          <Input
            label="Username"
            className=""
            value={username}
            setValue={setUsername}
            error={false}
            type="text"
          />
        </div>
        <Input
          label="Phone Number"
          className=""
          placeholder="Add Phone Number"
          value={phoneNumber}
          setValue={setPhoneNumber}
          error={false}
          type="text"
        />
        <Input
          label="Email address"
          className=""
          value={email}
          setValue={setPhoneNumber}
          error={false}
          placeholder="Add your email address"
          type="text"
        />
      </div>
      <div className="w-full flex flex-col gap-3">
        <div className="">
          <p className="text-xl">My Address</p>
          <span className="text-gray-400">
            Edit your address to your current address.
          </span>
        </div>
        <div className="w-full">
          <div className="flex gap-2 md:flex-col sm:flex-col items-center">
            <Input
              label="Nationality"
              className=""
              placeholder="Nigeria"
              value={nationality}
              setValue={setNationality}
              error={false}
              type="text"
            />
            <Input
              label="State"
              placeholder="Lagos"
              className=""
              value={state}
              setValue={setState}
              error={false}
              type="text"
            />
          </div>
          <Input
            label="Place of birth"
            className=""
            placeholder="Surulere"
            value={place_of_birth}
            setValue={setPlace_of_birth}
            type="text"
          />
        </div>
      </div>
      <div className="w-full flex flex-col gap-3">
        <div className="">
          <p className="text-xl">Additional Information</p>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-2 md:flex-col sm:flex-col items-center">
            <Input
              label="Occupation"
              className=""
              placeholder="Software Developer"
              value={occupation}
              setValue={setOccupation}
              type="text"
            />
            <Input
              label="Next of kin"
              className=""
              value={next_of_kin}
              setValue={setnext_of_kin}
              type="text"
              placeholder="E.g (Mother, Father, Brother e.t.c)"
            />
          </div>
          <Input
            label="Name of next of kin"
            className=""
            value={nok_name}
            setValue={setNok_name}
            error={false}
            type="text"
            placeholder="John doe"
          />
        </div>
        <div className="w-full flex flex-col gap-3">
          <div className="">
            <p className="text-xl">Change Password</p>
            <span className="text-gray-400">
              If you feel like your want to change your password do so.
            </span>
          </div>
          <div className="w-full flex flex-col gap-2">
            <Input
              className=""
              placeholder="Current Password"
              value={old_password}
              setValue={setOld_password}
              error={false}
              type="text"
            />
            <Input
              placeholder="New Password"
              className=""
              value={password}
              setValue={setPassword}
              error={false}
              type="password"
            />
            <Input
              className=""
              placeholder="Confirm Password"
              value={confirm_password}
              setValue={setConfirm_Password}
              type="password"
            />
            <Button
              borderRadius
              onClick={change_password}
              varient="filled"
              className="h-[2.5rem] w-full"
              name="Change"
              states={loading ? "loading" : undefined}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </SlideFromBelow>
  );
};

export default Personal;
