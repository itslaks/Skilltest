'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EditEmployeeDialogProps {
  employee: {
    id: string
    email: string
    full_name: string | null
    employee_id: string | null
    department: string | null
    domain: string | null
  }
}

const departments = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Product',
  'Design',
  'Customer Success',
  'Other',
]

const domains = ['Tech', 'Business', 'Creative', 'Operations', 'General']

export function EditEmployeeDialog({ employee }: EditEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: employee.full_name || '',
    employee_id: employee.employee_id || '',
    department: employee.department || '',
    domain: employee.domain || 'General',
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formData.full_name.trim()) {
      toast({
        title: 'Missing name',
        description: 'Full name is required.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/employees/${employee.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const result = await response.json()

        if (!response.ok) {
          toast({
            title: 'Update failed',
            description: result.error || 'Could not update employee.',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Employee updated',
          description: `${formData.full_name} is up to date.`,
        })
        setOpen(false)
        router.refresh()
      } catch {
        toast({
          title: 'Network error',
          description: 'Please try again.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee details used in assignments and reports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={employee.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`name-${employee.id}`}>Full Name *</Label>
              <Input
                id={`name-${employee.id}`}
                value={formData.full_name}
                onChange={(event) => setFormData((current) => ({ ...current, full_name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`empid-${employee.id}`}>Employee ID</Label>
              <Input
                id={`empid-${employee.id}`}
                value={formData.employee_id}
                onChange={(event) => setFormData((current) => ({ ...current, employee_id: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((current) => ({ ...current, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData((current) => ({ ...current, domain: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
