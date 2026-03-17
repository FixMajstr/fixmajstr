import {
  useFonts,
  LeagueSpartan_300Light,
  LeagueSpartan_400Regular,
  LeagueSpartan_500Medium,
  LeagueSpartan_700Bold,
} from '@expo-google-fonts/league-spartan';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    LeagueSpartan_300Light,
    LeagueSpartan_400Regular,
    LeagueSpartan_500Medium,
    LeagueSpartan_700Bold,
  });

  if (!fontsLoaded) return null;

  return <AppNavigator />;
}
