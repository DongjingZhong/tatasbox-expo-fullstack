import { Stack } from "expo-router";

export default function ChannelsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="communication/index" />

      {/* random 路由组 */}
      <Stack.Screen name="communication/random/index" />
      <Stack.Screen name="communication/random/chat" />

      {/* roleplay 路由组 */}
      <Stack.Screen name="communication/roleplay/index" />
      <Stack.Screen name="communication/roleplay/session" />

      {/* self explore 路由组 */}
      <Stack.Screen name="self-explore/index" />
      <Stack.Screen name="self-explore/home" />

      <Stack.Screen name="tools" />
    </Stack>
  );
}
