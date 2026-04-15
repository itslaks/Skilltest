'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { signIn } from '@/lib/actions/auth'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSignIn(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">SkillTest</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Welcome back</h1>
          <p className="text-muted-foreground text-lg">Sign in to your account to continue</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-black/5 bg-card/80 backdrop-blur-sm">
          <form action={handleSignIn}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-medium">Email Address</FieldLabel>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="yourname@company.com"
                      required
                      className="pl-11 h-12 text-base rounded-lg border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-11 h-12 text-base rounded-lg border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group" 
                disabled={isPending}
              >
                {isPending ? <Spinner className="mr-2" /> : null}
                Sign In
                {!isPending && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          <Link href="/" className="hover:text-muted-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
