import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Dashboard from "../components/Dashboard";

const Page = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        user && <Dashboard user={user} />
    );
};

export default Page;
