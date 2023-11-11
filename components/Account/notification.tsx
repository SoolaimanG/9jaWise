//------------------>All Imports<-----------------
import React from "react";
import CreditNotification from "./creditNotification";
import BillsNotification from "./billsNotification";
import InfoNotification from "./infoNotification";
import EmptyState from "./emptyState";
import { useStore } from "@/provider";
import SlideFromBelow from "../Animations/slideFromBelow";

const Notification = () => {
  const { user } = useStore();

  return (
    <SlideFromBelow className={`w-full relative h-full z-20 p-2`}>
      <div className="w-full flex flex-col gap-3">
        {user?.notifications?.length === 0 || !user?.notifications ? (
          <EmptyState message="No Notifications" />
        ) : (
          user?.notifications
            .sort((a, b) => b.time - a.time)
            ?.map((n, i) => (
              <div key={i}>
                {(n.type === "credit" || n.type === "debit") && (
                  <CreditNotification
                    status={n.type}
                    amount={n.amount as number}
                    acct={n.acct as number}
                    time={n.time}
                    id={n.transactionID!}
                  />
                )}
                {n.type === "bill" && (
                  <BillsNotification
                    type="bill"
                    amount={n.amount || 0}
                    billMessage={n?.billMessage || ""}
                    paymentFor={n.paymentFor || ""}
                    time={n.time}
                  />
                )}
                {(n.type === "info" ||
                  n.type === "email" ||
                  n.type === "warning") && (
                  <InfoNotification
                    type={n.type}
                    message={n.message || ""}
                    time={n.time}
                    header={n.header || ""}
                  />
                )}
              </div>
            ))
        )}
      </div>
    </SlideFromBelow>
  );
};

export default Notification;
