import { Stack } from "expo-router";

export default function ChannelsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      {/**decision 路由 */}
      <Stack.Screen name="decision/index" />
      <Stack.Screen name="decision/my/index" />
      <Stack.Screen name="decision/sim/index" />

      {/* random 路由组 */}
      <Stack.Screen name="communication/index" />
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
