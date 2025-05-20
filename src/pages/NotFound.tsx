
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! La pagina che stai cercando non esiste.
        </p>
        <p className="text-muted-foreground mb-8">
          La pagina potrebbe essere stata spostata, eliminata o forse non è mai esistita.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            Torna alla Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
