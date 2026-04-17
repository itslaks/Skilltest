'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toggleQuizActive } from '@/lib/actions/quiz'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface QuizToggleActiveProps {
  quizId: string
  isActive: boolean
}

export function QuizToggleActive({ quizId, isActive }: QuizToggleActiveProps) {
  const [checked, setChecked] = useState(isActive)
  const [isPending, startTransition] = useTransition()

  function handleToggle(newValue: boolean) {
    setChecked(newValue)
    startTransition(async () => {
      const result = await toggleQuizActive(quizId, newValue)
      if (result.error) {
        setChecked(!newValue) // Revert on error
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id={`active-${quizId}`}
          checked={checked}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
        <Label htmlFor={`active-${quizId}`} className="text-sm font-medium">
          {checked ? 'Active' : 'Draft'}
        </Label>
      </div>
      <Badge 
        variant={checked ? "default" : "secondary"} 
        className={`text-xs flex items-center gap-1 ${
          checked 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        }`}
      >
        {checked ? (
          <>
            <CheckCircle2 className="h-3 w-3" />
            Assignable
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3" />
            Review Needed
          </>
        )}
      </Badge>
    </div>
  )
}
