import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter()
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in")
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <SafeAreaView className='flex-1 justify-center items-center '>
      <Text>Profile</Text>
      <TouchableOpacity
        onPress={handleSignOut}
        className='bg-blue-600 rounded-lg px-4 py-2'
      >
        <Text className='text-white'>SignOut</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}