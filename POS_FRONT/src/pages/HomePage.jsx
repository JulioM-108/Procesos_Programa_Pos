import { useEffect, useState } from "react";
import { getSession } from "../api";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      setUser(session?.user || null);
    }
    fetchSession();
  }, []);

  return (
    <div>
      <h2>Bienvenido</h2>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>No has iniciado sesión</p>}
    </div>
  );
}
