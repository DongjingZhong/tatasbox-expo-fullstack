// All comments in English only.
import { SafeAreaView } from "react-native-safe-area-context";
// import TopBar from "@/components/ui/TopBar";
import ProfileForm from "@/components/profile/ProfileForm";

export default function ProfileIndex() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <TopBar left="back" /> */}
      <ProfileForm mode="setup" />
    </SafeAreaView>
  );
}
