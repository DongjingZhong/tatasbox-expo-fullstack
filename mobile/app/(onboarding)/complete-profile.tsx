import { SafeAreaView } from "react-native-safe-area-context";
import ProfileForm from "@/components/profile/ProfileForm";

export default function CompleteProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProfileForm mode="setup" />
    </SafeAreaView>
  );
}
