import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="mb-4 text-4xl font-bold">Welcome to Your App</h1>
          <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
          <Button onClick={() => navigate("/auth")} size="lg">
            Sign In / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-4xl font-bold">Welcome back!</h1>
        <p className="text-xl text-muted-foreground">You're signed in as {user.email}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/profile")} className="flex items-center gap-2">
            <User className="h-4 w-4" />
            View Profile
          </Button>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
