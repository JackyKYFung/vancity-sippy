"use client"

import { useState, SubmitEvent } from "react"

interface AuthViewProps {
  mode: "sign-in" | "register"
  onBack: () => void
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, username: string) => Promise<void>
}

export function AuthView({ mode, onBack, onSignIn, onSignUp }: AuthViewProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)

  const isSignIn = mode === "sign-in"

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!email || !password || (!isSignIn && !username)) return

    setLoading(true)
    try {
      if (isSignIn) {
        await onSignIn(email, password)
      } else {
        await onSignUp(email, password, username)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {isSignIn ? "Sign In to Vancity Sippy" : "Create an Account"}
        </h2>
        <button 
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* 🟢 The Form Element encapsulates the inputs and fires onSubmit */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isSignIn && (
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
              placeholder="coffeelover123"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
            placeholder="name@domain.com"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
            placeholder="••••••••"
          />
        </div>

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Processing..." : isSignIn ? "Sign In" : "Register"}
        </button>
      </form>
    </div>
  )
}