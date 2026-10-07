import { useAuth, useSignIn, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router';
import { useState } from 'react'
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const router = useRouter();


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [emailCodeError, setEmailCodeError] = useState<string | null>(null)

  const isLoading = fetchStatus === "fetching"

  const sendEmailCode = async () => {
    setEmailCodeError(null)
    try {
      const { error } = await signIn.mfa.sendEmailCode()
      if (error) {
        setEmailCodeError(error.message)
        return
      }

      setEmailCodeSent(true)
    } catch (error) {
      setEmailCodeError(
        error instanceof Error ? error.message : "Could not send the verification code.",
      )
    }
  }

  const sendPhoneCode = async () => {
    setEmailCodeError(null)
    try {
      const { error } = await signIn.mfa.sendPhoneCode()
      if (error) {
        setEmailCodeError(error.message)
        return
      }

      setPhoneCodeSent(true)
    } catch (error) {
      setEmailCodeError(
        error instanceof Error ? error.message : "Could not send the verification code.",
      )
    }
  }

  const onSignInPress = async () => {
    setEmailCodeSent(false)
    setPhoneCodeSent(false)
    setEmailCodeError(null)
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      alert(error.message)
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/")
          router.replace(url as any);
        }
      })
    } else if (signIn.status === "needs_second_factor") {
      await sendPhoneCode()
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(factor => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await sendEmailCode()
      } else {
        const otherFactors = signIn.supportedSecondFactors
          .map(factor => factor.strategy)
          .join(", ")
        setEmailCodeError(
          otherFactors
            ? `Email verification is unavailable. Supported factors: ${otherFactors}.`
            : "Email verification is unavailable for this sign-in.",
        )
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const onVerifyPress = async () => {
    const { error } = signIn.status === "needs_second_factor"
      ? await signIn.mfa.verifyPhoneCode({ code })
      : await signIn.mfa.verifyEmailCode({ code })

    if (error) {
      setEmailCodeError(error.message)
      return
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/")
          router.replace(url as any);
        }
      })
    }
  };

  const isEmailVerification = signIn.status === "needs_client_trust" && emailCodeSent
  const isPhoneVerification = signIn.status === "needs_second_factor" && phoneCodeSent

  if (isEmailVerification || isPhoneVerification) {
    return (
      <View className='flex-1 justify-center px-6 py-12'>
        <Image source={require("../../../assets/images/kribb.png")}
          className='w-32 h-16 mb-8'
          resizeMode='contain'
        />
        <Text className='text-3xl font-bold text-gray-800 mb-2'>
          Verify your account
        </Text>
        <Text className='text-gray-500 mb-8'>
          {isEmailVerification ? `We sent a code to ${email}` : "We sent a code to your phone"}
        </Text>

        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-4'
          placeholder='Enter verification code'
          placeholderTextColor="#9CA3AF"
          keyboardType='number-pad'
          value={code}
          onChangeText={setCode}
        />

        {errors.fields.code && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.code.message}
          </Text>
        )}

        {emailCodeError && (
          <Text className='text-red-500 mb-4'>
            {emailCodeError}
          </Text>
        )}

        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          className='w-full bg-blue-600 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className='text-white font-bold text-base'>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isEmailVerification ? sendEmailCode : sendPhoneCode}
          disabled={isLoading}
          className='py-2'
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className='text-blue-600'>I need a new code</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}
      className='bg-white'
      keyboardShouldPersistTaps="handled"
    >

      <View className='flex-1 justify-center px-6 py-12'>
        <Image source={require("../../../assets/images/kribb.png")}
          className='w-32 h-16 mb-8'
          resizeMode='contain'
        />
        <Text className='text-3xl font-bold text-gray-800 mb-2'>
          Welcome back
        </Text>
        <Text className='text-gray-500 mb-8'>Sign in to your account</Text>


        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-4'
          placeholder='Email address'
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        {errors.fields.identifier && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.identifier.message}
          </Text>
        )}

        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-6'
          placeholder='Password'
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errors.fields.password && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.password.message}
          </Text>
        )}

        {emailCodeError && (
          <Text className='text-red-500 mb-4'>
            {emailCodeError}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSignInPress}
          disabled={isLoading}
          className='bg-blue-600 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className='text-white font-bold text-base'>Sign In</Text>
          )}
        </TouchableOpacity>

        <View className='flex-row justify-center'>

          <Text className='text-gray-500'>Don't have an account? </Text>
          <Link href='/sign-up'>
            <Text className='text-blue-600 font-semibold'>Sign Up</Text>
          </Link>

        </View>

        <View nativeID='clerk-captcha' />

      </View>

    </ScrollView>
  )
}