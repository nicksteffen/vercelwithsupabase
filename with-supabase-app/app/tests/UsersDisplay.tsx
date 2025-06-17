import { createClient } from "@/lib/supabase/server";



export default async function UsersDisplay() {
const supabase = await createClient();

const { data: users  } = await supabase
// const { data: { users }, error } = await supabase
  .from("profiles")
  .select("*");

console.log("Users:", users);
//   .select("user_id, username");   

  return (
    <div>
      <h2>Profiles</h2>
      {/* {error && <p>Error loading users: {error.message}</p>} */}
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}

