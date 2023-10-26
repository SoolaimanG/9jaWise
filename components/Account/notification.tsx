import { notificationsProps } from "@/Models/user";
import React from "react";
import Expand from "../Animations/expand";
import CreditNotification from "./creditNotification";
import BillsNotification from "./billsNotification";
import InfoNotification from "./infoNotification";
import EmptyState from "./emptyState";
import { useStore } from "@/provider";

const Notification = () => {
  const { user } = useStore();

  return (
    <Expand className={`w-full relative h-full z-20 p-2`}>
      <div className="w-full flex flex-col gap-3">
        {user?.notifications?.length === 0 || !user?.notifications ? (
          <EmptyState message="No Notifications" />
        ) : (
          user?.notifications?.map((n, i) => (
            <div key={i}>
              {(n.type === "credit" || n.type === "debit") && (
                <CreditNotification
                  status={n.type}
                  amount={1000}
                  acct={8088362315}
                  time={Date.now()}
                  id=""
                />
              )}
              {n.type === "bill" && (
                <BillsNotification
                  type="bill"
                  amount={n.amount || 0}
                  billMessage={n?.billMessage || ""}
                  paymentFor={n.paymentFor || ""}
                  time={Date.now()}
                />
              )}
              {(n.type === "info" ||
                n.type === "email" ||
                n.type === "warning") && (
                <InfoNotification
                  type={n.type}
                  message={n.message || ""}
                  time={Date.now()}
                  header={n.header || ""}
                />
              )}
            </div>
          ))
        )}
      </div>
    </Expand>
  );
};

export default Notification;
