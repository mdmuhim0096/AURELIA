import NotificationsClient from "@/components/account/NotificationsClient"; 
export const metadata = { title: "Notifications" }; 

export default function Page() {
    return (
        <>
            <div className="dashboard-head">
                <div>
                    <span className="eyebrow">
                        Updates
                    </span>

                    <h1>
                        Notifications.
                    </h1>
                </div>
            </div>

            <NotificationsClient />
        </>
    );
}