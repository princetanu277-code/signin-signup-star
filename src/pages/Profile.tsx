import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Globe, MapPin, Calendar } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          website: data.website || "",
          location: data.location || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          username: formData.username || null,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          website: formData.website || null,
          location: formData.location || null,
        });

      if (error) throw error;

      await fetchProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{profile?.full_name || "Anonymous User"}</CardTitle>
              <CardDescription>@{profile?.username || "no-username"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
              {profile?.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile?.created_at || "").toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isEditing ? "Edit Profile" : "Profile Information"}
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: profile?.username || "",
                          full_name: profile?.full_name || "",
                          bio: profile?.bio || "",
                          website: profile?.website || "",
                          location: profile?.location || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City, Country"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {profile?.bio ? (
                    <div>
                      <h3 className="font-medium text-foreground">About</h3>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No bio available. Click "Edit Profile" to add one.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;