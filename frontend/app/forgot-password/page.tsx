import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
