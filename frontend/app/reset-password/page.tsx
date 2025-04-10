import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { ModeToggle } from "@/components/mode-toggle"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Create a new password for your account</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
